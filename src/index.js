const { app, BrowserWindow, ipcMain, dialog, globalShortcut} = require("electron");
const path = require("path");
const fs = require("fs").promises;
const os = require("os");
const Store = require("electron-store");
const crypto = require("crypto");
const mime = require('mime-types');

const genFilePathHash = (filePath) => {
  const hash = crypto.createHash("sha256");
  hash.update(filePath);
  const hashedText = hash.digest("hex");
  return hashedText;
};

const editorStore = new Store();

const openEditor = (editorId,filePath)=>{
  // new record for the file path
  fileKeyName =  filePath //genFilePathHash(filePath)
  if(editorStore.has(fileKeyName)){
    console.log(`Already open file:${filePath} in editor:${editorStore.get(fileKeyName)}`)
    return {success:false, message:"File already open", editorId:editorStore.get(fileKeyName)}
  }else{
    editorStore.set(fileKeyName,editorId)
    editorStore.set(editorId,fileKeyName)
    console.log(`Opening file:${filePath} in editor:${editorId}`)
    return {success:true, editorId:editorId}    
  }
  // new record for the editor with values filepath
  // will check if already open 
}

const openEditorCheckByFilePath = (filePath)=>{
  fileKeyName =  filePath //genFilePathHash(filePath)
  return editorStore.has(fileKeyName)
}

const closeEditor = (editor)=>{
  // get editor  value which is the filepath
  // delete the editor 
  // delete file path 
  filePathHash = editorStore.get(editor)
  let fname = filePathHash[editor]
  editorStore.delete(filePathHash[editor])
  editorStore.delete(editor)
  console.log(`Closing editor: ${editor} , with file : ${fname}`)
}


async function readFileContent(filePath) {
  try {
    const filePath1 = filePath.replace(/^~($|\/|\\)/, `${os.homedir()}$1`);
    const fullPath = path.join(filePath1);
    const content = await fs.readFile(fullPath, "utf-8");
    return content;
  } catch (error) {
    throw error;
  }
}

async function saveFile(filePath, content) {
  try {
    const filePath1 = filePath.replace(/^~($|\/|\\)/, `${os.homedir()}$1`);
    const fullPath = path.join(filePath1);
    await fs.writeFile(fullPath, content, "utf-8");
    console.log(`Saved file: ${fullPath}`);
  } catch (error) {
    throw error;
  }
}

async function openFile(event) {
  console.log(event)
  let editorId = event.frameId+""
  const { canceled, filePaths } = await dialog.showOpenDialog();
  if (!canceled) {
    registerOpen = openEditor(editorId,filePaths[0])
    if(registerOpen.success){
      fileData = await readFileContent(filePaths[0]);
      return { success: true, fileData, filePath: filePaths[0] };
    }else{
      return registerOpen
    }
  } else {
    return { success: false, message: "No file was selected" };
  }
}

async function openGivenFile(event,filePath) {
  let editorId = event.frameId+""
  if (filePath) {
    //console.log(editorId,filePath)
    registerOpen = openEditor(editorId,filePath)
    if(registerOpen.success){
      try {
        fileData = await readFileContent(filePath);
        return { success: true, fileData, filePath: filePath };  
      } catch (error) {
        console.log("Error reading given file path")
        return { success: false, fileData:"", filePath: "",message:"File not found" }; 
      }
    }else{
      return registerOpen
    }
  } else {
    return { success: false, message: "No file was selected" };
  }
}

function replaceFileName(originalPath, newFileName) {
  // Use the `lastIndexOf` method to find the last slash (/ or \) in the path
  const lastSlashIndex = originalPath.lastIndexOf('/');
  const lastBackslashIndex = originalPath.lastIndexOf('\\');

  // Determine the index of the last slash (whichever is found) to separate directory and file name
  const lastIndex = Math.max(lastSlashIndex, lastBackslashIndex);

  if (lastIndex >= 0) {
    // Extract the directory and file name
    const directory = originalPath.slice(0, lastIndex + 1); // Include the slash
    // Combine the directory and new file name
    const updatedPath = directory + newFileName;
    return updatedPath;
  } else {
    // No slash found in the path, cannot determine directory, return the new file name as is
    return newFileName;
  }
}

async function openAnotherDoc(event,currentFile,fileName){
  const updatedPath = replaceFileName(currentFile, fileName);
  registerOpen = openEditorCheckByFilePath(updatedPath)
  if(!registerOpen){
    console.log(`opening a new window to open ${updatedPath}`)
    createWindow({"openFileOnLoad":updatedPath})
  }else{
    console.log("Editor already open!")
    return registerOpen
  }
}

async function loadAnotherDoc(event,currentFile,fileName){
  try {
    filePath = replaceFileName(currentFile,fileName)
    const data = await fs.readFile(filePath);
    const base64Data = Buffer.from(data).toString('base64');
    console.log(`Attempting to load file : ${filePath} `)
    return {
      fileName: path.basename(filePath),
      fileType: mime.lookup(filePath) || 'application/octet-stream',
      filePath: filePath,
      success: true,
      base64Data: base64Data,
    };
  } catch (error) {
    console.log(error)
    return {
      fileName: path.basename(filePath),
      fileType: mime.lookup(filePath) || 'application/octet-stream',
      filePath: filePath,
      success: false,
      error: error.message,
    };
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = (options={openFileOnLoad:""}) => {
  // Create the browser window.
  addArgs = []
  if(options.openFileOnLoad){
    addArgs.push(`--openFileOnLoad=${options.openFileOnLoad}`)
  }
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      spellcheck:true,
      additionalArguments: addArgs
    },
    icon: "../icon/icon.png",
  });
  ipcMain.on("save-file", async (event, filePath, fileContent) => {
    await saveFile(filePath, fileContent);
    return { saved: true };
  });

  ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
  })
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.on("closed", (e) => {
    //console.log(e)
    //console.log(mainWindow)
    editorId = mainWindow.id
    //console.log(editorId)
    closeEditor(editorId)
  });
  // Create a menu item to open a new window
    const { Menu, MenuItem } = require("electron");
    const menu = Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            label: "New Editor",
            click: createWindow,
          },
          {
            label: "Dev tool",
            click: ()=>{mainWindow.webContents.openDevTools()},
          },
          // Add other menu items here
          // BrowserWindow.webContents.openDevTools()
        ],
      },
       {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ]);
    Menu.setApplicationMenu(menu);
  // Open the DevTools.
   mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

app.whenReady().then(() => {
  createWindow();
  ipcMain.handle("dialog:openFile", openFile);
  ipcMain.handle("open-given-file", openGivenFile);
  ipcMain.handle("open-doc-window", openAnotherDoc);
  ipcMain.handle("load-doc", loadAnotherDoc);
  globalShortcut.register("CommandOrControl+N", () => {
    createWindow();
  });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  console.log("Clearing the store...")
  editorStore.clear();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  editorStore.clear();
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("will-quit", () => {
  // Unregister the shortcut before quitting the app
  globalShortcut.unregisterAll();
});
