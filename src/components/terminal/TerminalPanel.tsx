import React, { useEffect, useRef, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { useTerminalStore } from '../../stores/useTerminalStore';
import 'xterm/css/xterm.css';

export default function TerminalPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const sessionId = useTerminalStore((s) => s.sessionId);
  const isConnected = useTerminalStore((s) => s.isConnected);
  const isBunAvailable = useTerminalStore((s) => s.isBunAvailable);
  const sendCommand = useTerminalStore((s) => s.sendCommand);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace",
      theme: {
        background: '#0d0d0d',
        foreground: '#cccccc',
        cursor: '#ffffff',
        selectionBackground: '#4da6ff88',
        black: '#1a1a1a',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#e5c07b',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#abb2bf',
        brightBlack: '#5c6370',
        brightRed: '#e06c75',
        brightGreen: '#98c379',
        brightYellow: '#e5c07b',
        brightBlue: '#61afef',
        brightMagenta: '#c678dd',
        brightCyan: '#56b6c2',
        brightWhite: '#ffffff',
      },
      allowProposedApi: true,
      allowTransparency: false,
      scrollback: 10000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    term.onData((data) => {
      if (sessionId != null && window.electronAPI) {
        window.electronAPI.terminal.write(sessionId, data);
      }
    });

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    // Listen for terminal output from main process
    let cleanup: (() => void) | undefined;
    if (window.electronAPI) {
      cleanup = window.electronAPI.terminal.onData(({ data }) => {
        term.write(data);
      });
    }

    // Resize handler
    const handleResize = () => {
      try {
        fitAddon.fit();
        if (sessionId != null && window.electronAPI) {
          window.electronAPI.terminal.resize(
            sessionId,
            term.cols,
            term.rows
          );
        }
      } catch {}
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      cleanup?.();
      term.dispose();
      terminalRef.current = null;
    };
  }, []);

  // Re-fit when session connects
  useEffect(() => {
    if (isConnected && fitAddonRef.current) {
      setTimeout(() => fitAddonRef.current?.fit(), 100);
    }
  }, [isConnected]);

  return (
    <div className="h-full w-full relative">
      {!isConnected && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ backgroundColor: 'var(--terminal-bg)' }}
        >
          <div className="text-center" style={{ color: 'var(--text-muted)' }}>
            {!isBunAvailable ? (
              <>
                <p className="text-base mb-2">Bun runtime not installed</p>
                <p className="text-sm mb-3">
                  Claude Code AI terminal requires Bun.
                </p>
                <a
                  href="https://bun.sh"
                  target="_blank"
                  className="text-sm"
                  style={{ color: 'var(--accent-color)' }}
                >
                  Install Bun →
                </a>
              </>
            ) : (
              <>
                <p className="text-base mb-2">AI Terminal</p>
                <p className="text-sm">Open a folder to start the terminal</p>
              </>
            )}
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
