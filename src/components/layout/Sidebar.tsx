import React, { useEffect } from 'react';
import FileTree from '../file-tree/FileTree';
import { useFileStore } from '../../stores/useFileStore';
import { useEditorStore } from '../../stores/useEditorStore';

export default function Sidebar() {
  const rootPath = useFileStore((s) => s.rootPath);
  const setRootPath = useFileStore((s) => s.setRootPath);
  const refreshTree = useFileStore((s) => s.refreshTree);
  const fileTree = useFileStore((s) => s.fileTree);

  const openFile = useEditorStore((s) => s.openFile);

  const handleFileSelect = async (filePath: string) => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.file.open(filePath);
    if (result) {
      openFile(result.path, result.content);
    }
  };

  const handleOpenFolder = async () => {
    // In a real app, this would use dialog.showOpenDialog({ properties: ['openDirectory'] })
    // For now, just trigger file open and derive directory from it
    if (!window.electronAPI) return;
    const result = await window.electronAPI.file.open();
    if (result) {
      const dir = result.path.split(/[/\\]/).slice(0, -1).join('/');
      setRootPath(dir);
      refreshTree();
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Explorer
        </span>
        <button
          className="toolbar-btn"
          onClick={handleOpenFolder}
          title="Open Folder"
          style={{ fontSize: '16px', lineHeight: 1 }}
        >
          +
        </button>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 py-1">
        {rootPath ? (
          <FileTree nodes={fileTree} onFileSelect={handleFileSelect} level={0} />
        ) : (
          <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm mb-2">No folder opened</p>
            <button
              className="toolbar-btn text-xs"
              onClick={handleOpenFolder}
            >
              Open Folder
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {rootPath && (
        <div
          className="px-3 py-1 text-xs truncate"
          style={{
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
          }}
          title={rootPath}
        >
          {rootPath.split(/[/\\]/).pop() || rootPath}
        </div>
      )}
    </div>
  );
}
