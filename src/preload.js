const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getEstimate: () => ipcRenderer.invoke('GET_ESTIMATE'),
  startExport: () => ipcRenderer.invoke('START_EXPORT'),
  showInFolder: (path) => ipcRenderer.invoke('SHOW_IN_FOLDER', path),
  onProgress: (callback) => ipcRenderer.on('EXPORT_PROGRESS', (event, value) => callback(value)),
  onProgressValue: (callback) => ipcRenderer.on('EXPORT_PROGRESS_VALUE', (event, value) => callback(value)),
  onError: (callback) => ipcRenderer.on('EXPORT_ERROR', (event, value) => callback(value)),
  onComplete: (callback) => ipcRenderer.on('EXPORT_COMPLETE', (event, value) => callback(value))
})
