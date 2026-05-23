import React, { useState, useRef, useCallback } from 'react';
import Sidebar from './Sidebar';
import BottomPanel from './BottomPanel';
import EditorTabs from '../editor/EditorTabs';
import EditorPane from '../editor/EditorPane';
import PreviewPane from '../preview/PreviewPane';
import StatusBar from '../statusbar/StatusBar';
import { useThemeStore } from '../../stores/useThemeStore';
import { usePreviewStore } from '../../stores/usePreviewStore';
import { useTerminalStore } from '../../stores/useTerminalStore';

export default function AppShell() {
  const isSidebarVisible = useThemeStore((s) => s.isSidebarVisible);
  const isFocusMode = useThemeStore((s) => s.isFocusMode);
  const viewMode = usePreviewStore((s) => s.viewMode);
  const isTerminalVisible = useTerminalStore((s) => s.isVisible);

  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [editorWidth, setEditorWidth] = useState<number | null>(null); // null = 50%
  const [terminalHeight, setTerminalHeight] = useState(250);

  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'sidebar' | 'editor' | 'terminal' | null>(null);

  const handleMouseDown = useCallback(
    (target: 'sidebar' | 'editor' | 'terminal') => (e: React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = target;
      document.body.style.cursor =
        target === 'terminal' ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';

      const handleMouseMove = (e: MouseEvent) => {
        if (!draggingRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        if (draggingRef.current === 'sidebar') {
          const w = Math.max(180, Math.min(400, e.clientX - rect.left));
          setSidebarWidth(w);
        } else if (draggingRef.current === 'editor') {
          const ratio = (e.clientX - rect.left - (isSidebarVisible ? sidebarWidth : 0)) /
            (rect.width - (isSidebarVisible ? sidebarWidth : 0));
          setEditorWidth(Math.round(ratio * 100));
        } else if (draggingRef.current === 'terminal') {
          const h = Math.max(100, Math.min(500, rect.bottom - e.clientY));
          setTerminalHeight(h);
        }
      };

      const handleMouseUp = () => {
        draggingRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [isSidebarVisible, sidebarWidth]
  );

  const showEditor = viewMode !== 'preview-only';
  const showPreview = viewMode !== 'edit-only';

  return (
    <div
      ref={containerRef}
      className="h-full w-full flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {isSidebarVisible && !isFocusMode && (
          <>
            <div style={{ width: sidebarWidth, flexShrink: 0 }}>
              <Sidebar />
            </div>
            <div
              className="resize-handle resize-handle-horizontal"
              onMouseDown={handleMouseDown('sidebar')}
            />
          </>
        )}

        {/* Center: Editor + Preview */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Tabs bar */}
          {!isFocusMode && <EditorTabs />}

          {/* Editor + Preview area */}
          <div className="flex-1 flex overflow-hidden">
            {showEditor && (
              <div
                className="overflow-hidden"
                style={{
                  flex: showPreview
                    ? editorWidth != null
                      ? `0 0 ${editorWidth}%`
                      : '1 1 50%'
                    : '1 1 100%',
                  minWidth: showPreview ? '200px' : 0,
                }}
              >
                <EditorPane />
              </div>
            )}

            {showEditor && showPreview && (
              <div
                className="resize-handle resize-handle-horizontal"
                onMouseDown={handleMouseDown('editor')}
              />
            )}

            {showPreview && (
              <div
                className="overflow-hidden"
                style={{
                  flex: showEditor
                    ? editorWidth != null
                      ? '1 1 auto'
                      : '1 1 50%'
                    : '1 1 100%',
                  minWidth: showEditor ? '200px' : 0,
                }}
              >
                <PreviewPane />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal resizer */}
      {isTerminalVisible && !isFocusMode && (
        <div
          className="resize-handle resize-handle-vertical"
          onMouseDown={handleMouseDown('terminal')}
        />
      )}

      {/* Bottom terminal panel */}
      {isTerminalVisible && !isFocusMode && (
        <div style={{ height: terminalHeight, flexShrink: 0 }}>
          <BottomPanel />
        </div>
      )}

      {/* Status bar */}
      {!isFocusMode && <StatusBar />}
    </div>
  );
}
