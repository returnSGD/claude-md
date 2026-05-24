import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { usePreviewStore } from '../../stores/usePreviewStore';
import { useChatStore } from '../../stores/useChatStore';

export default function StatusBar() {
  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const editorView = useEditorStore((s) => s.editorView);

  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const viewMode = usePreviewStore((s) => s.viewMode);
  const setViewMode = usePreviewStore((s) => s.setViewMode);
  const isChatVisible = useChatStore((s) => s.isVisible);
  const toggleChat = useChatStore((s) => s.toggleVisible);

  const tab = getActiveTab();
  const cursorPos = editorView
    ? `${editorView.state.selection.main.head + 1}`
    : '--';
  const lineCount = tab?.content?.split('\n').length ?? 0;
  const wordCount = tab?.content?.match(/[一-鿿\w]+/g)?.length ?? 0;

  return (
    <div
      className="flex items-center justify-between px-3 h-6 text-xs flex-shrink-0 select-none"
      style={{
        backgroundColor: 'var(--statusbar-bg)',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
      }}
    >
      {/* Left: file info */}
      <div className="flex items-center gap-3">
        <span>{tab?.fileName ?? 'No file'}</span>
        {tab && (
          <>
            <span>Line {cursorPos}</span>
            <span>{lineCount} lines</span>
            <span>{wordCount} words</span>
            <span style={{ color: 'var(--text-muted)' }}>Markdown</span>
          </>
        )}
      </div>

      {/* Right: indicators */}
      <div className="flex items-center gap-3">
        {/* View mode */}
        <button
          className="hover:underline cursor-pointer"
          style={{ border: 'none', background: 'none', color: 'inherit', fontSize: 'inherit' }}
          onClick={() => {
            const modes: Array<'split' | 'edit-only' | 'preview-only'> = ['split', 'edit-only', 'preview-only'];
            const idx = modes.indexOf(viewMode);
            setViewMode(modes[(idx + 1) % 3]);
          }}
          title="Toggle view mode"
        >
          {viewMode === 'split' ? '◫ Split' : viewMode === 'edit-only' ? '✎ Edit' : '◉ Preview'}
        </button>

        {/* Chat toggle */}
        <button
          className="hover:underline cursor-pointer"
          style={{ border: 'none', background: 'none', color: 'inherit', fontSize: 'inherit' }}
          onClick={toggleChat}
          title="Toggle Chat (Ctrl+J)"
        >
          {isChatVisible ? '▼ Chat' : '▶ Chat'}
        </button>

        {/* Settings */}
        <button
          className="hover:underline cursor-pointer"
          style={{ border: 'none', background: 'none', color: 'inherit', fontSize: 'inherit' }}
          onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
          title="Settings (Ctrl+,)"
        >
          ⚙ Settings
        </button>

        {/* Theme toggle */}
        <button
          className="hover:underline cursor-pointer"
          style={{ border: 'none', background: 'none', color: 'inherit', fontSize: 'inherit' }}
          onClick={toggleMode}
          title="Toggle theme"
        >
          {mode === 'dark' ? '🌙 Dark' : '☀ Light'}
        </button>
      </div>
    </div>
  );
}
