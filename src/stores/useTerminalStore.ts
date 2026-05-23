import { create } from 'zustand';

interface TerminalStore {
  sessionId: number | null;
  isConnected: boolean;
  isVisible: boolean;
  isBunAvailable: boolean;

  setSessionId: (id: number | null) => void;
  setConnected: (connected: boolean) => void;
  setVisible: (visible: boolean) => void;
  toggleVisible: () => void;
  setBunAvailable: (available: boolean) => void;

  connect: (workDir: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (cmd: string) => void;
  checkBunAvailability: () => Promise<void>;
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  sessionId: null,
  isConnected: false,
  isVisible: true,
  isBunAvailable: false,

  setSessionId: (id) => set({ sessionId: id }),
  setConnected: (connected) => set({ isConnected: connected }),
  setVisible: (visible) => set({ isVisible: visible }),
  toggleVisible: () => set((s) => ({ isVisible: !s.isVisible })),
  setBunAvailable: (available) => set({ isBunAvailable: available }),

  connect: async (workDir) => {
    if (!window.electronAPI) return;
    try {
      const id = await window.electronAPI.terminal.create(workDir);
      set({ sessionId: id, isConnected: true, isBunAvailable: true });
    } catch (err) {
      console.error('Failed to connect terminal:', err);
      set({ isConnected: false, isBunAvailable: false });
    }
  },

  checkBunAvailability: async () => {
    if (!window.electronAPI) return;
    try {
      const available = await window.electronAPI.terminal.checkBun();
      set({ isBunAvailable: available });
    } catch {
      set({ isBunAvailable: false });
    }
  },

  disconnect: async () => {
    const { sessionId } = get();
    if (sessionId != null && window.electronAPI) {
      await window.electronAPI.terminal.destroy(sessionId);
    }
    set({ sessionId: null, isConnected: false });
  },

  sendCommand: (cmd) => {
    const { sessionId } = get();
    if (sessionId != null && window.electronAPI) {
      window.electronAPI.terminal.write(sessionId, cmd + '\r');
    }
  },
}));
