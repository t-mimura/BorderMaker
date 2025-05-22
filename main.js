// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron'); // Added ipcMain, dialog
const path = require('path');
const fs = require('fs'); // Added fs
const nodePath = require('path'); // Renamed to avoid conflict with html path var if any

let mainWindow; // make mainWindow accessible

function createWindow () {
  mainWindow = new BrowserWindow({ // assign to mainWindow
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  mainWindow.loadFile('index.html');
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

// Listen for the 'open-file-dialog' message from renderer process
ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, { // pass mainWindow here
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      event.sender.send('selected-files', result.filePaths);
    } else {
      // Send an empty array or a specific message if no files were selected or dialog was cancelled
      event.sender.send('selected-files', []);
    }
  }).catch(err => {
    console.log(err);
    event.sender.send('selected-files', []); // Send empty array on error
  });
});

ipcMain.on('open-output-folder-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, { // Ensure mainWindow is accessible
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      event.sender.send('output-folder-selected', result.filePaths);
    } else {
      event.sender.send('output-folder-selected', null); // Send null or empty array if cancelled
    }
  }).catch(err => {
    console.log('Error opening directory dialog:', err);
    event.sender.send('output-folder-selected', null);
  });
});

ipcMain.on('save-image', (event, { buffer, newFileName, outputFolderPath }) => {
  if (!buffer || !newFileName || !outputFolderPath) {
    console.error('Invalid data received for save-image:', { newFileName, outputFolderPath });
    // Optionally send error back to renderer
    // event.sender.send('save-image-error', {fileName: newFileName, error: 'Invalid data'});
    return;
  }
  const outputPath = nodePath.join(outputFolderPath, newFileName);

  fs.writeFile(outputPath, buffer, (err) => {
    if (err) {
      console.error(`Failed to save image ${outputPath}:`, err);
      // Optionally send error back to renderer
      // event.sender.send('save-image-error', {fileName: newFileName, error: err.message});
    } else {
      console.log(`Image saved successfully: ${outputPath}`);
      // Optionally send success back to renderer
      // event.sender.send('save-image-success', {fileName: newFileName});
    }
  });
});
