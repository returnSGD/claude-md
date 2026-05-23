import { create } from 'zustand';
import type { EditorView } from '@codemirror/view';

export interface EditorTab {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  isDirty: boolean;
}

interface EditorStore {
  tabs: EditorTab[];
  activeTabId: string | null;
  editorView: EditorView | null;
  canUndo: boolean;
  canRedo: boolean;

  openFile: (filePath: string, content: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateContent: (tabId: string, content: string) => void;
  markSaved: (tabId: string) => void;
  setEditorView: (view: EditorView | null) => void;
  setUndoRedo: (canUndo: boolean, canRedo: boolean) => void;

  getActiveTab: () => EditorTab | undefined;
  getActiveContent: () => string;
}

let tabIdCounter = 0;

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  editorView: null,
  canUndo: false,
  canRedo: false,

  openFile: (filePath, content) => {
    const { tabs } = get();
    const existing = tabs.find((t) => t.filePath === filePath);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    const id = `tab_${++tabIdCounter}`;
    const fileName = filePath.split(/[/\\]/).pop() || 'Untitled';
    set({
      tabs: [...tabs, { id, filePath, fileName, content, isDirty: false }],
      activeTabId: id,
    });
  },

  closeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const idx = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);

    let newActiveId = activeTabId;
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        const newIdx = Math.min(idx, newTabs.length - 1);
        newActiveId = newTabs[newIdx].id;
      } else {
        newActiveId = null;
      }
    }

    set({ tabs: newTabs, activeTabId: newActiveId });
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  updateContent: (tabId, content) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, content, isDirty: true } : t
      ),
    }));
  },

  markSaved: (tabId) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, isDirty: false } : t
      ),
    }));
  },

  setEditorView: (view) => set({ editorView: view }),
  setUndoRedo: (canUndo, canRedo) => set({ canUndo, canRedo }),

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find((t) => t.id === activeTabId);
  },

  getActiveContent: () => {
    const tab = get().getActiveTab();
    return tab?.content ?? '';
  },
}));
