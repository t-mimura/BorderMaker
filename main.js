// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const nodePath = require('path'); // Using nodePath to avoid conflicts

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Required for Node.js integration in renderer
    }
  });
  mainWindow.loadFile('index.html');
  // For debugging:
  // mainWindow.webContents.openDevTools(); 
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      event.sender.send('selected-files', result.filePaths);
    } else {
      event.sender.send('selected-files', []); // Send empty if cancelled or no selection
    }
  }).catch(err => {
    console.error('File dialog error:', err); // Log error
    event.sender.send('selected-files', []); // Send empty on error
  });
});

ipcMain.on('open-output-folder-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      event.sender.send('output-folder-selected', result.filePaths[0]); // Send the first path
    } else {
      event.sender.send('output-folder-selected', null); // Send null if cancelled
    }
  }).catch(err => {
    console.error('Output folder dialog error:', err); // Log error
    event.sender.send('output-folder-selected', null); // Send null on error
  });
});

ipcMain.on('save-image', (event, { buffer, newFileName, outputFolderPath }) => {
  if (!buffer || !newFileName || !outputFolderPath) {
    console.error('Invalid data for save-image:', { newFileName, outputFolderPath });
    return;
  }
  const outputPath = nodePath.join(outputFolderPath, newFileName);

  fs.writeFile(outputPath, buffer, (err) => {
    if (err) {
      console.error(`Failed to save image ${outputPath}:', err);
    } else {
      console.log(`Image saved: ${outputPath}`);
    }
  });
});
