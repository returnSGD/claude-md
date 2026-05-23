import { useEffect, useRef } from 'react';
import { useEditorStore } from '../stores/useEditorStore';

const AUTOSAVE_DELAY = 2000; // 2 seconds after last edit
const DRAFT_KEY_PREFIX = 'md-editor-draft:';

/**
 * Auto-saves editor content to localStorage as drafts.
 * Also triggers file save via IPC when connected.
 */
export function useAutoSave() {
  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    const tab = getActiveTab();
    if (!tab) return;

    const draftKey = DRAFT_KEY_PREFIX + tab.filePath;
    const content = tab.content;

    // Don't save if unchanged
    if (content === lastSavedRef.current) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      // Save draft to localStorage
      try {
        localStorage.setItem(draftKey, content);
        lastSavedRef.current = content;
      } catch {
        // localStorage full or unavailable
      }

      // Also save via IPC if connected
      if (window.electronAPI && tab.filePath !== 'untitled.md') {
        window.electronAPI.file.save(tab.filePath, content);
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [activeTabId, getActiveTab()?.content]);

  // Load draft on file open
  const loadDraft = (filePath: string): string | null => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY_PREFIX + filePath);
      return draft;
    } catch {
      return null;
    }
  };

  const clearDraft = (filePath: string) => {
    try {
      localStorage.removeItem(DRAFT_KEY_PREFIX + filePath);
    } catch {
      // ignore
    }
  };

  return { loadDraft, clearDraft };
}
