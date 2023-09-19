// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge , ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (filePath,fileContent) => {
    ipcRenderer.send('save-file',filePath,fileContent)
  },
  setTitle: (title) => {
    ipcRenderer.send('set-title',title)
  },
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openAnotherDoc : (fileName)=>{
    ipcRenderer.invoke('open-doc',currentFile,fileName)
  },
  loadDoc : async (currentFile,fileName) =>{
    let data = await ipcRenderer.invoke('load-doc',currentFile,fileName)
    return data
  }
})

