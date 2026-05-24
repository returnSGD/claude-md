import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import path from 'path';
import { registerFileSystemHandlers } from './ipc/fileSystem';
import { registerTerminalHandlers } from './ipc/terminal';
import { registerExportHandlers } from './ipc/export';
import { registerImageHandlers } from './ipc/imageUpload';
import { registerChatHandlers } from './ipc/chat';
import { registerSettingsHandlers } from './ipc/settings';
import { buildAppMenu } from './menu/appMenu';
import { getUserDataPath, getConfigPath } from './utils/paths';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Claude MD Editor',
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const menu = buildAppMenu(mainWindow);
  Menu.setApplicationMenu(menu);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Register IPC handlers
  registerFileSystemHandlers(ipcMain);
  registerTerminalHandlers(ipcMain);
  registerExportHandlers(ipcMain);
  registerImageHandlers(ipcMain);
  registerChatHandlers(ipcMain);
  registerSettingsHandlers(ipcMain);

  // App-level IPC handlers
  ipcMain.handle('app:getVersion', () => app.getVersion());
  ipcMain.handle('app:getPlatform', () => process.platform);
  ipcMain.handle('app:getUserDataPath', () => getUserDataPath());
  ipcMain.handle('app:getConfigPath', () => getConfigPath());

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
