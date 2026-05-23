import { IpcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

function buildFileTree(dirPath: string): FileTreeNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: FileTreeNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path: fullPath,
        type: 'directory',
        children: buildFileTree(fullPath),
      });
    } else {
      nodes.push({
        name: entry.name,
        path: fullPath,
        type: 'file',
      });
    }
  }

  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function registerFileSystemHandlers(ipcMain: IpcMain) {
  ipcMain.handle('file:open', async (event, filePath?: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!filePath && win) {
      const result = await dialog.showOpenDialog(win, {
        title: 'Open Markdown File',
        filters: [
          { name: 'Markdown', extensions: ['md', 'markdown', 'mdown'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });
      if (result.canceled || result.filePaths.length === 0) return null;
      filePath = result.filePaths[0];
    }

    if (!filePath || !fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, 'utf-8');
    return { path: filePath, content };
  });

  ipcMain.handle('file:save', async (_event, filePath: string, content: string) => {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  });

  ipcMain.handle('file:saveAs', async (event, content: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;

    const result = await dialog.showSaveDialog(win, {
      title: 'Save Markdown File As',
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) return null;

    fs.writeFileSync(result.filePath, content, 'utf-8');
    return result.filePath;
  });

  ipcMain.handle('file:readDir', async (_event, dirPath: string) => {
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      return [];
    }
    return buildFileTree(dirPath);
  });

  ipcMain.handle('file:createFile', async (_event, parentPath: string, name: string) => {
    const filePath = path.join(parentPath, name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '', 'utf-8');
    }
    return filePath;
  });

  ipcMain.handle('file:createDir', async (_event, parentPath: string, name: string) => {
    const dirPath = path.join(parentPath, name);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  });

  ipcMain.handle('file:delete', async (_event, filePath: string) => {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
    return { success: true };
  });

  ipcMain.handle('file:rename', async (_event, oldPath: string, newPath: string) => {
    if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath);
    }
    return { success: true };
  });
}
