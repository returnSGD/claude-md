import { create } from 'zustand';
import type { FileTreeNode } from '../types/ipc';

interface FileStore {
  rootPath: string | null;
  fileTree: FileTreeNode[];
  expandedDirs: Set<string>;
  activeFilePath: string | null;

  setRootPath: (path: string) => void;
  setFileTree: (tree: FileTreeNode[]) => void;
  toggleDir: (path: string) => void;
  setActiveFilePath: (path: string | null) => void;
  refreshTree: () => Promise<void>;
}

export const useFileStore = create<FileStore>((set, get) => ({
  rootPath: null,
  fileTree: [],
  expandedDirs: new Set(),
  activeFilePath: null,

  setRootPath: (path) => set({ rootPath: path }),

  setFileTree: (tree) => set({ fileTree: tree }),

  toggleDir: (path) => {
    const expanded = new Set(get().expandedDirs);
    if (expanded.has(path)) {
      expanded.delete(path);
    } else {
      expanded.add(path);
    }
    set({ expandedDirs: expanded });
  },

  setActiveFilePath: (path) => set({ activeFilePath: path }),

  refreshTree: async () => {
    const { rootPath } = get();
    if (!rootPath || !window.electronAPI) return;
    const tree = await window.electronAPI.file.readDir(rootPath);
    set({ fileTree: tree });
  },
}));
