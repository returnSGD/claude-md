import React, { useEffect, useRef, useCallback } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { search } from '@codemirror/search';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import EditorToolbar from './EditorToolbar';
import { useEditorStore } from '../../stores/useEditorStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { usePreviewStore } from '../../stores/usePreviewStore';
import { useFileStore } from '../../stores/useFileStore';
import { useImagePaste } from '../../hooks/useImagePaste';

export default function EditorPane() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const getActiveContent = useEditorStore((s) => s.getActiveContent);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const updateContent = useEditorStore((s) => s.updateContent);
  const setEditorView = useEditorStore((s) => s.setEditorView);
  const setUndoRedo = useEditorStore((s) => s.setUndoRedo);

  const mode = useThemeStore((s) => s.mode);
  const fontSize = useThemeStore((s) => s.fontSize);
  const setScrollRatio = usePreviewStore((s) => s.setScrollRatio);

  const handleChange = useCallback(
    (doc: string) => {
      const tab = getActiveTab();
      if (tab) {
        updateContent(tab.id, doc);
      }
    },
    [activeTabId]
  );

  // Create or update editor
  useEffect(() => {
    if (!containerRef.current) return;

    // If editor exists, just update content for tab switch
    if (viewRef.current) {
      const tab = getActiveTab();
      if (tab) {
        const currentContent = viewRef.current.state.doc.toString();
        if (tab.content !== currentContent) {
          viewRef.current.dispatch({
            changes: {
              from: 0,
              to: currentContent.length,
              insert: tab.content,
            },
          });
        }
      }
      return;
    }

    // Create editor
    const initialContent = getActiveContent();

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const doc = update.state.doc.toString();
        handleChange(doc);
        setUndoRedo(true, true);
      }

      if (update.viewportChanged) {
        const scroller = update.view.scrollDOM;
        const maxScroll = scroller.scrollHeight - scroller.clientHeight;
        const ratio = maxScroll > 0 ? scroller.scrollTop / maxScroll : 0;
        setScrollRatio(isNaN(ratio) ? 0 : ratio);
      }
    });

    const view = new EditorView({
      state: EditorState.create({
        doc: initialContent,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          history(),
          markdown({
            base: markdownLanguage,
          }),
          search({ top: true }),
          autocompletion(),
          closeBrackets(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          mode === 'dark' ? oneDark : syntaxHighlighting(defaultHighlightStyle),
          updateListener,
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: `${fontSize}px`,
              backgroundColor: 'var(--editor-bg)',
            },
            '.cm-scroller': {
              lineHeight: '1.6',
            },
            '.cm-gutters': {
              backgroundColor: 'var(--editor-bg)',
              borderRight: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
            },
            '.cm-activeLineGutter': {
              backgroundColor: 'var(--bg-secondary)',
            },
            '.cm-activeLine': {
              backgroundColor: 'var(--bg-secondary)',
            },
            '.cm-cursor': {
              borderLeftColor: 'var(--text-primary)',
            },
            '.cm-selectionBackground': {
              backgroundColor: 'var(--accent-color) !important',
              opacity: 0.3,
            },
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    setEditorView(view);

    return () => {
      view.destroy();
      viewRef.current = null;
      setEditorView(null);
    };
  }, [mode, fontSize]);

  // Handle tab content changes from outside
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const tab = getActiveTab();
    if (tab && view.state.doc.toString() !== tab.content) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: tab.content },
      });
    }
  }, [activeTabId]);

  const rootPath = useFileStore((s) => s.rootPath);

  // Image paste & drag-drop
  useImagePaste(viewRef.current, rootPath);

  const tab = getActiveTab();

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar editorView={viewRef.current} />
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        style={{ backgroundColor: 'var(--editor-bg)' }}
      />
      {!tab && (
        <div
          className="flex-1 flex items-center justify-center"
          style={{ color: 'var(--text-muted)' }}
        >
          <div className="text-center">
            <p className="text-lg mb-2">No file open</p>
            <p className="text-sm">Open a file or folder to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
