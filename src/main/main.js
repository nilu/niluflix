const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

// Disable hardware acceleration to prevent GPU crashes
app.disableHardwareAcceleration();

function createWindow() {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Disable web security for development
    },
    titleBarStyle: 'hiddenInset',
    show: false, // Don't show until ready-to-show
  });

  // Load the app
  const isDev = process.argv.includes('--dev');
  if (isDev) {
    // In development, load the built React app
    mainWindow.loadFile('dist/renderer/index.html');
  } else {
    // In production, load from dist
    mainWindow.loadFile('dist/renderer/index.html');
  }

  // Show when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle page load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Log when page is loaded
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  // Enable context menu for right-click
  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Cut',
        role: 'cut',
        enabled: params.isEditable
      },
      {
        label: 'Copy',
        role: 'copy',
        enabled: params.selectionText.length > 0
      },
      {
        label: 'Paste',
        role: 'paste',
        enabled: params.isEditable
      },
      { type: 'separator' },
      {
        label: 'Select All',
        role: 'selectall'
      },
      { type: 'separator' },
      {
        label: 'Reload',
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        role: 'toggleDevTools'
      }
    ]);
    
    menu.popup();
  });

  // Set application menu
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const appMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(appMenu);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
