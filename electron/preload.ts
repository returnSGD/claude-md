import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  file: {
    open: (filePath?: string) => ipcRenderer.invoke('file:open', filePath),
    save: (filePath: string, content: string) =>
      ipcRenderer.invoke('file:save', filePath, content),
    saveAs: (content: string) => ipcRenderer.invoke('file:saveAs', content),
    readDir: (dirPath: string) => ipcRenderer.invoke('file:readDir', dirPath),
    createFile: (parentPath: string, name: string) =>
      ipcRenderer.invoke('file:createFile', parentPath, name),
    createDir: (parentPath: string, name: string) =>
      ipcRenderer.invoke('file:createDir', parentPath, name),
    delete: (filePath: string) => ipcRenderer.invoke('file:delete', filePath),
    rename: (oldPath: string, newPath: string) =>
      ipcRenderer.invoke('file:rename', oldPath, newPath),
    onFileChange: (callback: (events: any) => void) => {
      const handler = (_event: any, data: any) => callback(data);
      ipcRenderer.on('file:changed', handler);
      return () => ipcRenderer.removeListener('file:changed', handler);
    },
  },

  terminal: {
    checkBun: () => ipcRenderer.invoke('terminal:checkBun'),
    create: (workDir: string, options?: { cols?: number; rows?: number }) =>
      ipcRenderer.invoke('terminal:create', workDir, options),
    write: (sessionId: number, data: string) =>
      ipcRenderer.invoke('terminal:write', sessionId, data),
    resize: (sessionId: number, cols: number, rows: number) =>
      ipcRenderer.invoke('terminal:resize', sessionId, cols, rows),
    destroy: (sessionId: number) =>
      ipcRenderer.invoke('terminal:destroy', sessionId),
    onData: (callback: (data: { sessionId: number; data: string }) => void) => {
      const handler = (_event: any, data: any) => callback(data);
      ipcRenderer.on('terminal:data', handler);
      return () => ipcRenderer.removeListener('terminal:data', handler);
    },
  },

  export: {
    html: (content: string, options?: any) =>
      ipcRenderer.invoke('export:html', content, options),
    pdf: (content: string, options?: any) =>
      ipcRenderer.invoke('export:pdf', content, options),
    docx: (content: string, options?: any) =>
      ipcRenderer.invoke('export:docx', content, options),
  },

  image: {
    uploadFromPath: (filePath: string) =>
      ipcRenderer.invoke('image:uploadFromPath', filePath),
    saveLocal: (base64: string, fileName: string) =>
      ipcRenderer.invoke('image:saveLocal', base64, fileName),
  },

  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
    getUserDataPath: () => ipcRenderer.invoke('app:getUserDataPath'),
    getConfigPath: () => ipcRenderer.invoke('app:getConfigPath'),
    onMenuAction: (callback: (action: string) => void) => {
      const handler = (_event: any, action: string) => callback(action);
      ipcRenderer.on('menu:action', handler);
      return () => ipcRenderer.removeListener('menu:action', handler);
    },
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
