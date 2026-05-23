import React, { useState } from 'react';
import type { FileTreeNode } from '../../types/ipc';
import { useFileStore } from '../../stores/useFileStore';

interface FileTreeProps {
  nodes: FileTreeNode[];
  onFileSelect: (path: string) => void;
  level: number;
}

export default function FileTree({ nodes, onFileSelect, level }: FileTreeProps) {
  return (
    <div style={{ paddingLeft: level === 0 ? 0 : 0 }}>
      {nodes.map((node) => (
        <FileTreeNodeItem
          key={node.path}
          node={node}
          onFileSelect={onFileSelect}
          level={level}
        />
      ))}
    </div>
  );
}

function FileTreeNodeItem({
  node,
  onFileSelect,
  level,
}: {
  node: FileTreeNode;
  onFileSelect: (path: string) => void;
  level: number;
}) {
  const expandedDirs = useFileStore((s) => s.expandedDirs);
  const toggleDir = useFileStore((s) => s.toggleDir);
  const activeFilePath = useFileStore((s) => s.activeFilePath);

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });

  const isExpanded = expandedDirs.has(node.path);
  const isActive = activeFilePath === node.path;

  const handleClick = () => {
    if (node.type === 'directory') {
      toggleDir(node.path);
    } else {
      onFileSelect(node.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const icon =
    node.type === 'directory'
      ? isExpanded
        ? '📂'
        : '📁'
      : node.name.endsWith('.md')
        ? '📝'
        : node.name.endsWith('.png') || node.name.endsWith('.jpg')
          ? '🖼'
          : '📄';

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-0.5 cursor-pointer text-sm select-none rounded"
        style={{
          paddingLeft: `${level * 16 + 8}px`,
          backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={node.path}
      >
        <span className="text-xs flex-shrink-0" style={{ width: 16, textAlign: 'center' }}>
          {icon}
        </span>
        <span className="truncate flex-1 text-xs">{node.name}</span>
      </div>

      {node.type === 'directory' && isExpanded && node.children && (
        <FileTree
          nodes={node.children}
          onFileSelect={onFileSelect}
          level={level + 1}
        />
      )}

      {/* Context menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="context-menu"
            style={{ left: contextPos.x, top: contextPos.y }}
          >
            {node.type === 'directory' && (
              <>
                <div className="context-menu-item">📄 New File</div>
                <div className="context-menu-item">📁 New Folder</div>
                <div className="context-menu-separator" />
              </>
            )}
            <div className="context-menu-item">✏️ Rename</div>
            <div className="context-menu-item" style={{ color: '#e06c75' }}>
              🗑 Delete
            </div>
          </div>
        </>
      )}
    </div>
  );
}
