const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const { calculateTotalSize, getChunkFiles, getTotalSizeBytes } = require('./rewind-utils')

// Handle FFmpeg path for dev and prod
let ffmpegPath = require('ffmpeg-static');
if (ffmpegPath.includes('app.asar')) {
    ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
}

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700, // Increased height for disclaimer
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('GET_ESTIMATE', async () => {
    try {
        return calculateTotalSize()
    } catch (error) {
        throw new Error(error.message)
    }
})

ipcMain.handle('SHOW_IN_FOLDER', async (event, fullPath) => {
    shell.showItemInFolder(fullPath)
})

ipcMain.handle('START_EXPORT', async (event) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Exported Video',
        defaultPath: 'rewind-export.mp4',
        filters: [{ name: 'Movies', extensions: ['mp4'] }]
    })

    if (canceled || !filePath) {
        return 'canceled'
    }

    try {
        mainWindow.webContents.send('EXPORT_PROGRESS', 'Gathering files...')
        const videos = getChunkFiles()
        
        if (videos.length === 0) {
            throw new Error('No Rewind video chunks found.')
        }

        // Create temporary list file for ffmpeg
        const listContent = videos.map(video => `file '${video}'`).join('\n')
        const listPath = path.join(app.getPath('temp'), 'rewind_videos.txt')
        fs.writeFileSync(listPath, listContent)

        const totalSizeBytes = getTotalSizeBytes()
        mainWindow.webContents.send('EXPORT_PROGRESS', 'Starting FFmpeg export...')

        // Run ffmpeg
        const ffmpegArgs = [
            '-f', 'concat',
            '-safe', '0',
            '-i', listPath,
            '-c', 'copy',
            '-y', // Overwrite output
            filePath
        ]

        const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs)

        let stderrBuffer = ''

        ffmpegProcess.stderr.on('data', (data) => {
            stderrBuffer += data.toString()
            
            // Process complete lines only
            let lines = stderrBuffer.split(/[\r\n]+/)
            
            // Keep the last incomplete line in the buffer
            if (stderrBuffer.endsWith('\n') || stderrBuffer.endsWith('\r')) {
                stderrBuffer = ''
            } else {
                stderrBuffer = lines.pop()
            }

            for (const line of lines) {
                // Parse size to calculate progress
                const sizeMatch = line.match(/size=\s*(\d+)(kB|MB|GB|B)?/)
                if (sizeMatch && totalSizeBytes > 0) {
                    let currentSize = parseInt(sizeMatch[1])
                    const unit = sizeMatch[2] || 'B'
                    
                    // Convert to bytes
                    if (unit === 'kB') currentSize *= 1024
                    else if (unit === 'MB') currentSize *= 1024 * 1024
                    else if (unit === 'GB') currentSize *= 1024 * 1024 * 1024
                    
                    const percentage = Math.min(100, (currentSize / totalSizeBytes) * 100)
                    mainWindow.webContents.send('EXPORT_PROGRESS_VALUE', percentage)
                }

                if (line.includes('time=')) {
                     mainWindow.webContents.send('EXPORT_PROGRESS', `Exporting... ${line.match(/time=[\d:.]+/)?.[0] || ''}`)
                }
            }
        })

        ffmpegProcess.on('close', (code) => {
            // Clean up temp file
            try { fs.unlinkSync(listPath) } catch (e) {}

            if (code === 0) {
                mainWindow.webContents.send('EXPORT_COMPLETE', filePath)
            } else {
                mainWindow.webContents.send('EXPORT_ERROR', `FFmpeg exited with code ${code}`)
            }
        })

        ffmpegProcess.on('error', (err) => {
             mainWindow.webContents.send('EXPORT_ERROR', `Failed to spawn FFmpeg: ${err.message}`)
        })

        return 'started'

    } catch (error) {
        throw new Error(error.message)
    }
})
