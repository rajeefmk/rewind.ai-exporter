const fs = require('fs')
const path = require('path')
const os = require('os')

// Helper to format bytes
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function getRewindRootDir() {
    return path.join(os.homedir(), 'Library/Application Support/com.memoryvault.MemoryVault')
}

function getChunkFiles() {
    const ROOT_DIR = getRewindRootDir()
    const chunksDir = path.join(ROOT_DIR, 'chunks')

    if (!fs.existsSync(chunksDir)) {
        throw new Error(`Rewind directory not found at: ${chunksDir}`)
    }

    // Find all chunks
    let chunkNames = fs.readdirSync(chunksDir)

    // Remove .DS_Store
    chunkNames = chunkNames.filter(chunkName => chunkName !== '.DS_Store')

    // Add date object
    const chunkMonths = chunkNames.map(chunkName => {
        const year = chunkName.substring(0, 4)
        const month = chunkName.substring(4)

        return {
            date: new Date(year, month - 1),
            folder: chunkName
        }
    })

    const chunkDays = chunkMonths.map(({ date: _date, folder }) => {
        const monthPath = path.join(chunksDir, folder)
        const contents = fs.readdirSync(monthPath).filter(day => day !== '.DS_Store')

        const days = contents.map(day => {
            const date = new Date(_date)
            date.setDate(parseInt(day))

            return {
                date,
                folder: path.join(folder, day)
            }
        })

        return days
    }).flat()

    let chunks = chunkDays.map(chunkDay => {
        const dayPath = path.join(chunksDir, chunkDay.folder)
        return {
            date: chunkDay.date,
            path: fs.readdirSync(dayPath).map(chunk => path.join(dayPath, chunk))
        }
    }).flat()

    // Sort properly based on date
    chunks = chunks.sort((a, b) => a.date.getTime() - b.date.getTime())
    
    // Flatten to just paths
    const videoPaths = chunks.map(chunk => chunk.path).flat()

    return videoPaths
}

function getTotalSizeBytes() {
    const videos = getChunkFiles()
    if (videos.length === 0) return 0
    
    const videoStats = videos.map(video => fs.statSync(video))
    const totalSize = videoStats.map(stat => stat.size).reduce((a, b) => a + b, 0)

    return totalSize
}

function calculateTotalSize() {
    return formatBytes(getTotalSizeBytes())
}

module.exports = {
    getChunkFiles,
    calculateTotalSize,
    getTotalSizeBytes,
    formatBytes
}
