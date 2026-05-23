import { IpcMain, BrowserWindow } from 'electron';
import * as pty from 'node-pty';
import { findBun } from '../utils/bunResolver';

interface TerminalSession {
  id: number;
  ptyProcess: pty.IPty;
}

const sessions = new Map<number, TerminalSession>();
let nextSessionId = 1;

function getShell(): { cmd: string; args: string[] } {
  if (process.platform === 'win32') {
    const cmd = process.env.COMSPEC || 'cmd.exe';
    // Force UTF-8 code page so Chinese characters render correctly
    return { cmd, args: ['/K', 'chcp', '65001', '>nul'] };
  }
  return {
    cmd: process.env.SHELL || '/bin/bash',
    args: [],
  };
}

export function registerTerminalHandlers(ipcMain: IpcMain) {
  ipcMain.handle('terminal:checkBun', async () => {
    return findBun() !== null;
  });

  ipcMain.handle('terminal:create', async (event, workDir: string, options?: { cols?: number; rows?: number }) => {
    const id = nextSessionId++;
    const win = BrowserWindow.fromWebContents(event.sender);
    const { cmd, args } = getShell();

    const cols = options?.cols || 80;
    const rows = options?.rows || 24;

    const ptyProcess = pty.spawn(cmd, args, {
      name: 'xterm-256color',
      cols,
      rows,
      cwd: workDir,
      env: {
        ...process.env,
        LANG: 'zh_CN.UTF-8',
        LC_ALL: 'zh_CN.UTF-8',
      },
    });

    ptyProcess.onData((data: string) => {
      win?.webContents.send('terminal:data', {
        sessionId: id,
        data,
      });
    });

    ptyProcess.onExit(({ exitCode }) => {
      win?.webContents.send('terminal:data', {
        sessionId: id,
        data: `\r\n[Process exited with code ${exitCode}]\r\n`,
      });
      sessions.delete(id);
    });

    sessions.set(id, { id, ptyProcess });

    return id;
  });

  ipcMain.handle('terminal:write', (_event, sessionId: number, data: string) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.ptyProcess.write(data);
    }
  });

  ipcMain.handle('terminal:resize', (_event, sessionId: number, cols: number, rows: number) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.ptyProcess.resize(cols, rows);
    }
  });

  ipcMain.handle('terminal:destroy', (_event, sessionId: number) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.ptyProcess.kill();
      sessions.delete(sessionId);
    }
  });
}
