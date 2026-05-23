import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useFileStore } from '../../stores/useFileStore';

interface SearchResult {
  filePath: string;
  fileName: string;
  line: number;
  content: string;
  matchStart: number;
  matchEnd: number;
}

export default function GlobalSearchDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [replaceText, setReplaceText] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const openFile = useEditorStore((s) => s.openFile);
  const editorView = useEditorStore((s) => s.editorView);
  const fileTree = useFileStore((s) => s.fileTree);
  const rootPath = useFileStore((s) => s.rootPath);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const searchFiles = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !rootPath) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      const found: SearchResult[] = [];

      async function searchInTree(nodes: typeof fileTree) {
        for (const node of nodes) {
          if (node.type === 'directory' && node.children) {
            await searchInTree(node.children);
          } else if (node.type === 'file' && /\.(md|txt|js|ts|tsx|jsx|json|css|html)$/i.test(node.name)) {
            try {
              const result = await window.electronAPI?.file.open(node.path);
              if (!result) return;

              const lines = result.content.split('\n');
              const lowerQuery = searchQuery.toLowerCase();

              for (let i = 0; i < lines.length; i++) {
                const lowerLine = lines[i].toLowerCase();
                let idx = lowerLine.indexOf(lowerQuery);
                while (idx !== -1) {
                  found.push({
                    filePath: node.path,
                    fileName: node.name,
                    line: i + 1,
                    content: lines[i].trim(),
                    matchStart: idx,
                    matchEnd: idx + searchQuery.length,
                  });
                  idx = lowerLine.indexOf(lowerQuery, idx + 1);
                }
              }
            } catch {
              // skip unreadable files
            }
          }
        }
      }

      await searchInTree(fileTree);
      setResults(found);
      setSelectedIdx(0);
      setIsSearching(false);
    },
    [rootPath, fileTree]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results.length > 0) {
          handleOpenResult(results[selectedIdx]);
        } else {
          searchFiles(query);
        }
      }
    },
    [results, selectedIdx, query]
  );

  const handleOpenResult = async (result: SearchResult) => {
    const fileResult = await window.electronAPI?.file.open(result.filePath);
    if (fileResult) {
      openFile(fileResult.path, fileResult.content);
      // Navigate to line in editor
      setTimeout(() => {
        const tab = useEditorStore.getState().getActiveTab();
        if (tab) {
          const view = useEditorStore.getState().editorView;
          if (view) {
            const line = view.state.doc.line(result.line);
            view.dispatch({
              selection: { anchor: line.from, head: line.from },
              scrollIntoView: true,
            });
          }
        }
      }, 100);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fade-in rounded-lg shadow-2xl overflow-hidden"
        style={{
          width: 640,
          maxHeight: '70vh',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 p-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              searchFiles(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search across all files..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            className="text-xs px-2 py-0.5 rounded"
            style={{
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            onClick={() => setShowReplace(!showReplace)}
          >
            {showReplace ? '¬ Replace' : '≡ Replace'}
          </button>
        </div>

        {/* Replace input */}
        {showReplace && (
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
            />
            <button
              className="text-xs px-2 py-0.5 rounded"
              style={{
                border: '1px solid var(--border-color)',
                background: 'var(--accent-color)',
                color: '#fff',
                cursor: 'pointer',
              }}
              onClick={() => {/* TODO: replace all */}}
            >
              Replace All
            </button>
          </div>
        )}

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
          {isSearching ? (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Searching...
            </div>
          ) : results.length === 0 && query ? (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No results found
            </div>
          ) : (
            results.map((result, idx) => (
              <div
                key={`${result.filePath}:${result.line}:${result.matchStart}`}
                className="flex items-start gap-3 px-3 py-1.5 cursor-pointer text-sm"
                style={{
                  backgroundColor: idx === selectedIdx ? 'var(--bg-tertiary)' : 'transparent',
                  borderLeft: idx === selectedIdx ? '3px solid var(--accent-color)' : '3px solid transparent',
                }}
                onClick={() => handleOpenResult(result)}
                onMouseEnter={() => setSelectedIdx(idx)}
              >
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)', minWidth: 100, textAlign: 'right' }}>
                  {result.fileName}:{result.line}
                </span>
                <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                  {result.content.slice(0, 120)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-3 py-1.5 text-xs"
          style={{
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
          <span>↑↓ navigate · Enter open · Esc close</span>
        </div>
      </div>
    </div>
  );
}
