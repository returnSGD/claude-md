import React from 'react';
import type { EditorView } from '@codemirror/view';

interface ToolbarButton {
  label: string;
  title: string;
  shortcut?: string;
  action: (view: EditorView) => void;
}

interface EditorToolbarProps {
  editorView: EditorView | null;
}

export default function EditorToolbar({ editorView }: EditorToolbarProps) {
  if (!editorView) return null;

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const selection = editorView.state.selection.main;
    const selectedText = editorView.state.sliceDoc(selection.from, selection.to);
    const text = prefix + selectedText + suffix;
    editorView.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: text,
      },
      selection: {
        anchor: selection.from + prefix.length,
        head: selection.from + prefix.length + selectedText.length,
      },
    });
    editorView.focus();
  };

  const insertLine = (text: string) => {
    const pos = editorView.state.selection.main.head;
    const line = editorView.state.doc.lineAt(pos);
    editorView.dispatch({
      changes: { from: line.to, insert: '\n' + text },
      selection: { anchor: line.to + text.length + 1 },
    });
    editorView.focus();
  };

  const buttons: ToolbarButton[] = [
    { label: 'H1', title: 'Heading 1 (Ctrl+1)', action: () => insertLine('# ') },
    { label: 'H2', title: 'Heading 2 (Ctrl+2)', action: () => insertLine('## ') },
    { label: 'H3', title: 'Heading 3 (Ctrl+3)', action: () => insertLine('### ') },
    { label: 'B', title: 'Bold (Ctrl+B)', action: () => insertMarkdown('**', '**') },
    { label: 'I', title: 'Italic (Ctrl+I)', action: () => insertMarkdown('*', '*') },
    { label: 'S', title: 'Strikethrough', action: () => insertMarkdown('~~', '~~') },
    { label: '🔗', title: 'Link (Ctrl+K)', action: () => insertMarkdown('[', '](url)') },
    { label: '🖼', title: 'Image', action: () => insertMarkdown('![alt](', ')') },
    { label: '"', title: 'Blockquote', action: () => insertLine('> ') },
    { label: '•', title: 'Unordered List', action: () => insertLine('- ') },
    { label: '1.', title: 'Ordered List', action: () => insertLine('1. ') },
    { label: '✅', title: 'Task List', action: () => insertLine('- [ ] ') },
    { label: '📊', title: 'Insert Table', action: () => insertLine('| Col1 | Col2 | Col3 |\n|------|------|------|\n| | | |') },
    { label: '</>', title: 'Code Block', action: () => insertMarkdown('\n```\n', '\n```\n') },
    { label: '—', title: 'Horizontal Rule', action: () => insertLine('---') },
  ];

  return (
    <div
      className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto flex-shrink-0"
      style={{
        backgroundColor: 'var(--toolbar-bg)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      {buttons.map((btn) => (
        <button
          key={btn.label}
          className="toolbar-btn"
          title={btn.title}
          onClick={() => btn.action(editorView)}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
