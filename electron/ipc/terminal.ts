import { IpcMain, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import { findBun } from '../utils/bunResolver';

interface TerminalSession {
  id: number;
  process: ChildProcess;
}

const sessions = new Map<number, TerminalSession>();
let nextSessionId = 1;

export function registerTerminalHandlers(ipcMain: IpcMain) {
  ipcMain.handle('terminal:create', async (_event, workDir: string) => {
    const bunPath = findBun();
    if (!bunPath) {
      throw new Error(
        'Bun runtime not found. Please install Bun from https://bun.sh'
      );
    }

    const id = nextSessionId++;
    const win = BrowserWindow.getFocusedWindow();

    // Determine the Claude Code entry point
    // In development, it's relative to the project; in production, bundled with app
    const claudeCodeEntry = process.env.CLAUDE_CODE_ENTRY || 'claude';

    const child = spawn(bunPath, [claudeCodeEntry], {
      cwd: workDir,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        // Pass through API key from app config
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
    });

    child.stdout?.on('data', (data: Buffer) => {
      win?.webContents.send('terminal:data', {
        sessionId: id,
        data: data.toString(),
      });
    });

    child.stderr?.on('data', (data: Buffer) => {
      win?.webContents.send('terminal:data', {
        sessionId: id,
        data: data.toString(),
      });
    });

    child.on('exit', (code) => {
      win?.webContents.send('terminal:data', {
        sessionId: id,
        data: `\r\n[Claude Code exited with code ${code}]\r\n`,
      });
      sessions.delete(id);
    });

    child.on('error', (err) => {
      win?.webContents.send('terminal:data', {
        sessionId: id,
        data: `\r\n[Error: ${err.message}]\r\n`,
      });
    });

    sessions.set(id, { id, process: child });

    return id;
  });

  ipcMain.handle('terminal:write', (_event, sessionId: number, data: string) => {
    const session = sessions.get(sessionId);
    if (session && session.process.stdin) {
      session.process.stdin.write(data);
    }
  });

  ipcMain.handle('terminal:resize', (_event, sessionId: number, cols: number, rows: number) => {
    // PTY resize not applicable for spawn-based approach
    // For full PTY support, integrate node-pty here
  });

  ipcMain.handle('terminal:destroy', (_event, sessionId: number) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.process.kill();
      sessions.delete(sessionId);
    }
  });
}
