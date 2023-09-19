// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge , ipcRenderer} = require('electron')

function collectArgumentsIntoObject(args) {
  const collectedArgs = {};
  args.forEach(arg => {
    // Check if the argument matches the "--key=value" pattern
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2];
      collectedArgs[key] = value;
    }
  });
  return collectedArgs;
}

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (filePath,fileContent) => {
    ipcRenderer.send('save-file',filePath,fileContent)
  },
  setTitle: (title) => {
    ipcRenderer.send('set-title',title)
  },
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openSelectedFile : async (filePath)=>{ 
    let data = await ipcRenderer.invoke('open-given-file',filePath)
    return data
   },
  openAnotherDoc : (currentFile,fileName)=>{
    ipcRenderer.invoke('open-doc-window',currentFile,fileName)
  },
  loadDoc : async (currentFile,fileName) =>{
    let data = await ipcRenderer.invoke('load-doc',currentFile,fileName)
    return data
  },
  getArgs : ()=>{
    if(process.argv){
      return collectArgumentsIntoObject(process.argv) 
    }else{
      return {}
    }
  }
})

