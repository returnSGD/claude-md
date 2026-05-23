import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  codeTheme: string;
  fontSize: number;
  lineHeight: number;
  maxWidth: number;
  isFocusMode: boolean;
  isSidebarVisible: boolean;

  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setCodeTheme: (theme: string) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setMaxWidth: (width: number) => void;
  setFocusMode: (focus: boolean) => void;
  toggleFocusMode: () => void;
  setSidebarVisible: (visible: boolean) => void;
  toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'dark',
  codeTheme: 'one-dark',
  fontSize: 16,
  lineHeight: 1.6,
  maxWidth: 800,
  isFocusMode: false,
  isSidebarVisible: true,

  setMode: (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    set({ mode });
  },

  toggleMode: () => {
    set((s) => {
      const mode = s.mode === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', mode);
      return { mode };
    });
  },

  setCodeTheme: (codeTheme) => set({ codeTheme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setLineHeight: (lineHeight) => set({ lineHeight }),
  setMaxWidth: (maxWidth) => set({ maxWidth }),

  setFocusMode: (isFocusMode) => set({ isFocusMode }),
  toggleFocusMode: () => set((s) => ({ isFocusMode: !s.isFocusMode })),

  setSidebarVisible: (isSidebarVisible) => set({ isSidebarVisible }),
  toggleSidebar: () => set((s) => ({ isSidebarVisible: !s.isSidebarVisible })),
}));
