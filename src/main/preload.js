const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Video playback
  playVideo: (filePath) => ipcRenderer.invoke('play-video', filePath),
  
  // Utility functions
  platform: process.platform,
  
  // Add other IPC methods here as needed
  // download: (data) => ipcRenderer.invoke('download-content', data),
  // getDownloads: () => ipcRenderer.invoke('get-downloads'),
});
