import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';

export default function EditorTabs() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);

  if (tabs.length === 0) {
    return (
      <div
        className="flex items-center px-3 h-9 text-xs"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          color: 'var(--text-muted)',
        }}
      >
        No files open. Use File → Open or press Ctrl+O
      </div>
    );
  }

  return (
    <div
      className="flex items-center h-9 overflow-x-auto"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className={`flex items-center gap-1 px-3 h-full text-xs cursor-pointer select-none border-r whitespace-nowrap ${
              isActive ? 'border-t-2' : ''
            }`}
            style={{
              backgroundColor: isActive
                ? 'var(--tab-active-bg)'
                : 'var(--tab-inactive-bg)',
              borderRightColor: 'var(--border-color)',
              borderTopColor: isActive ? 'var(--accent-color)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              maxWidth: 180,
            }}
            onClick={() => setActiveTab(tab.id)}
            title={tab.filePath}
          >
            <span className="truncate flex-1">{tab.fileName}</span>
            {tab.isDirty && (
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>●</span>
            )}
            <button
              className="flex items-center justify-center rounded hover:opacity-70"
              style={{
                width: 16,
                height: 16,
                fontSize: 10,
                lineHeight: 1,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              title="Close"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
