import { useEffect, useCallback } from 'react';
import type { EditorView } from '@codemirror/view';

/**
 * Handle image paste and drag-drop in CodeMirror editor.
 * Pastes/drops images to local project assets and inserts ![](path).
 */
export function useImagePaste(
  editorView: EditorView | null,
  projectRoot: string | null
) {
  const insertImageAtCursor = useCallback(
    (imagePath: string, view: EditorView) => {
      const pos = view.state.selection.main.head;
      const md = `![image](${imagePath})`;
      view.dispatch({
        changes: { from: pos, to: pos, insert: md },
        selection: { anchor: pos + md.length },
      });
      view.focus();
    },
    []
  );

  // Handle paste events on the editor DOM
  useEffect(() => {
    const view = editorView;
    if (!view) return;

    const dom = view.dom;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const blob = item.getAsFile();
          if (!blob) continue;

          // Convert to base64 and save via IPC
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
            const ext = item.type.split('/')[1] || 'png';
            const fileName = `paste_${Date.now()}.${ext}`;

            if (window.electronAPI) {
              try {
                const result = await window.electronAPI.image.saveLocal(
                  base64,
                  fileName
                );
                insertImageAtCursor(result.url, view);
              } catch {
                // If IPC fails, insert as base64 data URI directly
                insertImageAtCursor(base64, view);
              }
            } else {
              insertImageAtCursor(base64, view);
            }
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };

    const handleDrop = async (e: DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files) return;

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          e.preventDefault();

          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
            const fileName = `drop_${Date.now()}_${file.name}`;

            if (window.electronAPI) {
              try {
                const result = await window.electronAPI.image.saveLocal(
                  base64,
                  fileName
                );
                insertImageAtCursor(result.url, view);
              } catch {
                insertImageAtCursor(base64, view);
              }
            } else {
              insertImageAtCursor(base64, view);
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    dom.addEventListener('paste', handlePaste);
    dom.addEventListener('drop', handleDrop);

    return () => {
      dom.removeEventListener('paste', handlePaste);
      dom.removeEventListener('drop', handleDrop);
    };
  }, [editorView, projectRoot, insertImageAtCursor]);
}
