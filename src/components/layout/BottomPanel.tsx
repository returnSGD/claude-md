import React from 'react';
import TerminalPanel from '../terminal/TerminalPanel';
import { useTerminalStore } from '../../stores/useTerminalStore';

export default function BottomPanel() {
  const toggleVisible = useTerminalStore((s) => s.toggleVisible);
  const isConnected = useTerminalStore((s) => s.isConnected);

  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: 'var(--terminal-bg)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      {/* Terminal header */}
      <div
        className="flex items-center justify-between px-3 py-1 flex-shrink-0"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            AI Terminal
          </span>
          {isConnected && (
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: '#98c379' }}
              title="Connected"
            />
          )}
        </div>
        <button
          className="toolbar-btn text-xs"
          onClick={toggleVisible}
          title="Close Terminal (Ctrl+J)"
        >
          ✕
        </button>
      </div>

      {/* Terminal content */}
      <div className="flex-1 overflow-hidden">
        <TerminalPanel />
      </div>
    </div>
  );
}
