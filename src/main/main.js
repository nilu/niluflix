const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Import memory manager (will be available after TypeScript compilation)
// const MemoryManager = require('../shared/services/memory-manager').default;

// Skip hardware acceleration disable for now to avoid crashes
// app.disableHardwareAcceleration();

// Global variable to store the API server process
let apiServerProcess = null;

// Initialize memory manager (commented out until TypeScript compilation)
// const memoryManager = MemoryManager.getInstance();

function startApiServer() {
  const isDev = process.argv.includes('--dev');
  
  if (isDev) {
    // In development, use ts-node to run the TypeScript server
    console.log('🚀 Starting API server in development mode...');
    apiServerProcess = spawn('npx', ['ts-node', 'src/server/index.ts'], {
      stdio: 'inherit',
      shell: true
    });
  } else {
    // In production, run the compiled JavaScript
    console.log('🚀 Starting API server in production mode...');
    apiServerProcess = spawn('node', ['dist/server/src/server/index.js'], {
      stdio: 'inherit',
      shell: true
    });
  }

  apiServerProcess.on('error', (error) => {
    console.error('❌ Failed to start API server:', error);
  });

  apiServerProcess.on('exit', (code, signal) => {
    console.log(`📴 API server exited with code ${code} and signal ${signal}`);
    apiServerProcess = null;
  });

  console.log(`🚀 API server started with PID: ${apiServerProcess.pid}`);

  return apiServerProcess;
}

function stopApiServer() {
  if (apiServerProcess) {
    console.log('📴 Stopping API server...');
    
    // Set up event listeners before killing
    apiServerProcess.on('exit', (code, signal) => {
      console.log(`✅ API server stopped (code: ${code}, signal: ${signal})`);
      apiServerProcess = null;
    });
    
    // Send SIGTERM first
    apiServerProcess.kill('SIGTERM');
    
    // Force kill after 3 seconds if it doesn't stop gracefully
    setTimeout(() => {
      if (apiServerProcess && !apiServerProcess.killed) {
        console.log('⚠️ Force killing API server...');
        apiServerProcess.kill('SIGKILL');
      }
    }, 3000);
  } else {
    console.log('📴 No API server process to stop');
  }
}

function createWindow() {
  // Debug icon path - use different paths for dev vs production
  const iconPath = process.env.NODE_ENV === 'production' 
    ? path.join(process.resourcesPath, 'icon.icns')
    : path.join(process.cwd(), 'build/icon.icns');
  console.log('Icon path:', iconPath);
  console.log('Icon exists:', require('fs').existsSync(iconPath));
  
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
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
    // Try setting icon after window is ready - use relative path for built app
    const iconPath = process.env.NODE_ENV === 'production' 
      ? path.join(process.resourcesPath, 'icon.icns')
      : '/Users/nilu/workspace/niluflix/build/icon.icns';
    try {
      mainWindow.setIcon(iconPath);
    } catch (error) {
      console.log('Icon setting failed:', error.message);
    }
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
if (typeof app !== 'undefined' && app) {
  app.whenReady().then(() => {
    // Start the API server first
    startApiServer();
    // Then create the window
    createWindow();
  });

  // Quit when all windows are closed, except on macOS
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      stopApiServer();
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

  // Handle app quit
  app.on('before-quit', (event) => {
    console.log('📴 App is quitting, stopping API server...');
    
    if (apiServerProcess) {
      // Prevent default quit behavior
      event.preventDefault();
      
      // Stop the server and then quit
      stopApiServer();
      
      // Wait a moment for graceful shutdown, then force quit
      setTimeout(() => {
        console.log('📴 Force quitting app...');
        app.exit(0);
      }, 2000);
    }
  });

  // Handle process termination signals
  process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received, shutting down gracefully...');
    stopApiServer();
    app.quit();
  });

  process.on('SIGINT', () => {
    console.log('📴 SIGINT received, shutting down gracefully...');
    stopApiServer();
    app.quit();
  });
} else {
  console.error('Electron app object is not available. Make sure you are running this in an Electron context.');
}
