import React from 'react';
import ChatPanel from '../chat/ChatPanel';
import { useChatStore } from '../../stores/useChatStore';

export default function BottomPanel() {
  const toggleVisible = useChatStore((s) => s.toggleVisible);
  const isConnected = useChatStore((s) => s.isConnected);

  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      {/* Chat header */}
      <div
        className="flex items-center justify-between px-3 py-1 flex-shrink-0"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-secondary)' }}
          >
            Claude Code Chat
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
          title="Close Chat (Ctrl+J)"
        >
          ✕
        </button>
      </div>

      {/* Chat content */}
      <div className="flex-1 overflow-hidden">
        <ChatPanel />
      </div>
    </div>
  );
}
