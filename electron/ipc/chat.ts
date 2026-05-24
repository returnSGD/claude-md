import { IpcMain, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import { readConfig } from './settings';

interface ChatSession {
  id: string;
  claudeSessionId?: string;  // Claude's session ID for --resume
  workDir: string;
  win: BrowserWindow;
  process?: ChildProcess;    // Current active generating process
}

const sessions = new Map<string, ChatSession>();

function findClaude(): string {
  return process.platform === 'win32' ? 'claude.cmd' : 'claude';
}

function buildStdinMessage(content: string): string {
  return JSON.stringify({
    type: 'user',
    message: { role: 'user', content },
    parent_tool_use_id: null,
  }) + '\n';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function buildSpawnArgs(claudeSessionId?: string): string[] {
  const args = [
    '-p',
    '--input-format', 'stream-json',
    '--output-format', 'stream-json',
    '--verbose',
    '--include-partial-messages',
    '--dangerously-skip-permissions',
  ];
  if (claudeSessionId) {
    args.push('--resume', claudeSessionId);
  }
  return args;
}

function buildEnv(): Record<string, string> {
  const cfg = readConfig();
  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    NO_COLOR: '1',
  };
  if (cfg.apiKey) {
    env.ANTHROPIC_API_KEY = cfg.apiKey;
  }
  if (cfg.apiBaseUrl) {
    env.ANTHROPIC_BASE_URL = cfg.apiBaseUrl;
  }
  return env;
}

export function registerChatHandlers(ipcMain: IpcMain) {
  // Start a chat session — creates session state but doesn't spawn a process yet
  ipcMain.handle('chat:start', async (event, workDir: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;

    const sessionId = generateId();
    const session: ChatSession = {
      id: sessionId,
      workDir,
      win,
    };
    sessions.set(sessionId, session);

    win.webContents.send('chat:message', {
      type: 'system',
      subtype: 'init',
      sessionId,
      cwd: workDir,
    });

    return sessionId;
  });

  // Send user message — spawns a new claude process per message
  ipcMain.handle('chat:send', async (_event, sessionId: string, content: string) => {
    const session = sessions.get(sessionId);
    if (!session) return false;

    // Don't allow sending while already generating
    if (session.process && !session.process.killed) {
      return false;
    }

    const cli = findClaude();
    const args = buildSpawnArgs(session.claudeSessionId);

    console.log('[chat] spawning:', cli, args.join(' '));
    console.log('[chat] cwd:', session.workDir);

    try {
      const proc = spawn(cli, args, {
        cwd: session.workDir,
        env: buildEnv(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      session.process = proc;

      let buffer = '';

      proc.stdout!.on('data', (chunk: Buffer) => {
        buffer += chunk.toString('utf-8');
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            forwardMessage(session.win, sessionId, session, parsed);
          } catch {
            // Non-JSON line, ignore
          }
        }
      });

      proc.stderr!.on('data', (chunk: Buffer) => {
        session.win.webContents.send('chat:message', {
          type: 'system',
          subtype: 'stderr',
          sessionId,
          text: chunk.toString('utf-8'),
        });
      });

      proc.on('error', (err) => {
        session.win.webContents.send('chat:message', {
          type: 'system',
          subtype: 'error',
          sessionId,
          error: `Failed to start Claude Code: ${err.message}`,
        });
        session.process = undefined;
      });

      proc.on('exit', (code) => {
        // Flush any remaining buffered data
        if (buffer.trim()) {
          try {
            const parsed = JSON.parse(buffer.trim());
            forwardMessage(session.win, sessionId, session, parsed);
          } catch {}
        }

        session.process = undefined;
        if (code !== 0) {
          session.win.webContents.send('chat:message', {
            type: 'system',
            subtype: 'exit',
            sessionId,
            code,
          });
        }
      });

      // Write message and close stdin so claude -p knows input is complete
      proc.stdin!.write(buildStdinMessage(content));
      proc.stdin!.end();

      return true;
    } catch (err: any) {
      session.win.webContents.send('chat:message', {
        type: 'system',
        subtype: 'error',
        sessionId,
        error: `Error: ${err.message}`,
      });
      session.process = undefined;
      return false;
    }
  });

  // Interrupt current generation
  ipcMain.handle('chat:interrupt', async (_event, sessionId: string) => {
    const session = sessions.get(sessionId);
    if (!session?.process) return false;

    try {
      session.process.kill('SIGINT');
    } catch {}
    return true;
  });

  // Stop chat session
  ipcMain.handle('chat:stop', async (_event, sessionId: string) => {
    const session = sessions.get(sessionId);
    if (!session) return false;

    if (session.process) {
      try {
        session.process.kill();
      } catch {}
    }
    sessions.delete(sessionId);
    return true;
  });
}

function forwardMessage(win: BrowserWindow, sessionId: string, session: ChatSession, msg: any) {
  // Capture claude session ID from result for --resume on next message
  if (msg.type === 'result' && msg.session_id) {
    session.claudeSessionId = msg.session_id;
  }

  switch (msg.type) {
    case 'stream_event': {
      const ev = msg.event;
      if (!ev) return;

      if (ev.type === 'content_block_start') {
        win.webContents.send('chat:message', {
          type: 'block_start',
          sessionId,
          blockType: ev.content_block?.type || 'text',
          blockIndex: ev.index,
          toolName: ev.content_block?.name,
          toolId: ev.content_block?.id,
        });
        return;
      }

      if (ev.type === 'content_block_delta') {
        const delta = ev.delta;
        if (!delta) return;
        if (delta.type === 'text_delta') {
          win.webContents.send('chat:message', {
            type: 'text_delta',
            sessionId,
            text: delta.text,
            blockIndex: ev.index,
          });
        } else if (delta.type === 'input_json_delta') {
          win.webContents.send('chat:message', {
            type: 'tool_input_delta',
            sessionId,
            text: delta.partial_json,
            blockIndex: ev.index,
          });
        }
        return;
      }

      if (ev.type === 'content_block_stop') {
        win.webContents.send('chat:message', {
          type: 'block_stop',
          sessionId,
          blockIndex: ev.index,
        });
        return;
      }
      break;
    }

    case 'assistant': {
      win.webContents.send('chat:message', {
        type: 'turn_complete',
        sessionId,
        message: msg.message,
        uuid: msg.uuid,
      });
      return;
    }

    case 'result': {
      win.webContents.send('chat:message', {
        type: 'result',
        sessionId,
        subtype: msg.subtype,
        durationMs: msg.duration_ms,
        totalCostUsd: msg.total_cost_usd,
        usage: msg.usage,
        numTurns: msg.num_turns,
        session_id: msg.session_id,
      });
      return;
    }

    case 'system': {
      win.webContents.send('chat:message', {
        type: 'system_msg',
        sessionId,
        subtype: msg.subtype,
        text: msg.message || msg.text,
      });
      return;
    }

    case 'tool_progress': {
      win.webContents.send('chat:message', {
        type: 'tool_progress',
        sessionId,
        toolName: msg.tool_name,
        toolId: msg.tool_use_id,
        status: msg.status,
        output: msg.output,
      });
      return;
    }

    case 'partial_assistant': {
      win.webContents.send('chat:message', {
        type: 'partial_assistant',
        sessionId,
        message: msg.message,
      });
      return;
    }

    case 'status': {
      win.webContents.send('chat:message', {
        type: 'status',
        sessionId,
        text: msg.message || msg.status,
      });
      return;
    }

    default:
      break;
  }
}
