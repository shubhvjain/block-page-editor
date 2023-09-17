const { app, BrowserWindow,ipcMain,dialog ,globalShortcut} = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');


async function readFileContent(filePath) {
  try {
    const filePath1 = filePath.replace(/^~($|\/|\\)/, `${os.homedir()}$1`);
    const fullPath = path.join(filePath1);
    const content = await fs.readFile(fullPath, 'utf-8');
    return content;
  } catch (error) {
      throw error;
  }
}

async function saveFile(filePath, content) {
try {
  const filePath1 = filePath.replace(/^~($|\/|\\)/, `${os.homedir()}$1`);
  const fullPath = path.join(filePath1);
  await fs.writeFile(fullPath, content, 'utf-8');
  console.log(`Saved file.....${fullPath}`)
} catch (error) {
    throw error;
}
}

async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (!canceled) {
    fileData = await readFileContent(filePaths[0])
    return {fileData,filePath:filePaths[0]}
  }
} 

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 950,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  ipcMain.on('save-file', async (event,filePath,fileContent) => {
    await saveFile(filePath,fileContent)
    return {saved:true}
  })
  
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

app.whenReady().then(() => {
  createWindow()
  ipcMain.handle('dialog:openFile', handleFileOpen)

  globalShortcut.register('CommandOrControl+N', () => {
    createWindow();
  });
  // Create a menu item to open a new window
  const { Menu, MenuItem } = require('electron');
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          click: createWindow,
        },
        // Add other menu items here
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Unregister the shortcut before quitting the app
  globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
