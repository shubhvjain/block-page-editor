// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge , ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (filePath,fileContent) => {
    ipcRenderer.send('save-file',filePath,fileContent)
  },
  openFile: () => ipcRenderer.invoke('dialog:openFile')
})

