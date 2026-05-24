import { create } from 'zustand';

export interface ExportSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  pageSize: 'A4' | 'Letter';
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

interface SettingsState {
  // API
  apiKey: string;
  apiBaseUrl: string;

  // Export
  exportSettings: ExportSettings;

  // Loaded flag
  loaded: boolean;

  // Actions
  setApiKey: (key: string) => void;
  setApiBaseUrl: (url: string) => void;
  setExportSettings: (s: Partial<ExportSettings>) => void;
  load: () => Promise<void>;
  save: () => Promise<void>;
}

const DEFAULT_EXPORT: ExportSettings = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
  fontSize: 14,
  lineHeight: 1.7,
  pageSize: 'A4',
  marginTop: 1.0,
  marginBottom: 1.0,
  marginLeft: 1.5,
  marginRight: 1.5,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiKey: '',
  apiBaseUrl: '',
  exportSettings: { ...DEFAULT_EXPORT },
  loaded: false,

  setApiKey: (key) => set({ apiKey: key }),
  setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
  setExportSettings: (s) =>
    set((st) => ({ exportSettings: { ...st.exportSettings, ...s } })),

  load: async () => {
    if (!window.electronAPI) return;
    try {
      const cfg = await window.electronAPI.settings.getAll();
      if (cfg) {
        set({
          apiKey: cfg.apiKey || '',
          apiBaseUrl: cfg.apiBaseUrl || '',
          exportSettings: cfg.exportSettings
            ? { ...DEFAULT_EXPORT, ...cfg.exportSettings }
            : { ...DEFAULT_EXPORT },
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  save: async () => {
    if (!window.electronAPI) return;
    const { apiKey, apiBaseUrl, exportSettings } = get();
    try {
      await window.electronAPI.settings.saveAll({
        apiKey,
        apiBaseUrl,
        exportSettings,
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  },
}));
