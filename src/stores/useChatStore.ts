import { create } from 'zustand';

// ── Types ──

export interface ChatTextBlock {
  type: 'text';
  text: string;
}

export interface ChatToolBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: string;        // JSON string accumulated during streaming
  output?: string;      // Tool result
  status: 'pending' | 'running' | 'done' | 'error';
  collapsed: boolean;
}

export type ChatContentBlock = ChatTextBlock | ChatToolBlock;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  blocks: ChatContentBlock[];
  timestamp: number;
  isStreaming: boolean;
  usage?: { inputTokens: number; outputTokens: number };
  cost?: number;
}

interface ChatStore {
  sessionId: string | null;
  isConnected: boolean;
  isGenerating: boolean;
  isVisible: boolean;
  messages: ChatMessage[];
  inputValue: string;

  // Actions
  setVisible: (v: boolean) => void;
  toggleVisible: () => void;
  setInputValue: (v: string) => void;

  connect: (workDir: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: () => Promise<void>;
  interrupt: () => Promise<void>;

  // Internal — called by IPC listener
  _addMessage: (msg: ChatMessage) => void;
  _updateMessage: (id: string, fn: (msg: ChatMessage) => ChatMessage) => void;
  _setGenerating: (v: boolean) => void;
  _setConnected: (v: boolean) => void;
  _appendToLastBlock: (role: 'assistant', text: string) => void;
  _startToolBlock: (id: string, name: string, blockIndex: number) => void;
  _appendToolInput: (text: string) => void;
  _finishStreaming: (usage?: { inputTokens: number; outputTokens: number }, cost?: number) => void;
  _addSystemMessage: (text: string) => void;
  _handleToolProgress: (toolId: string, status: string, output?: string) => void;
}

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessionId: null,
  isConnected: false,
  isGenerating: false,
  isVisible: true,
  messages: [],
  inputValue: '',

  setVisible: (v) => set({ isVisible: v }),
  toggleVisible: () => set((s) => ({ isVisible: !s.isVisible })),
  setInputValue: (v) => set({ inputValue: v }),

  connect: async (workDir) => {
    if (!window.electronAPI) return;
    try {
      const id = await window.electronAPI.chat.start(workDir);
      if (id) {
        set({ sessionId: id, isConnected: true, messages: [] });
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
      set({ isConnected: false });
    }
  },

  disconnect: async () => {
    const { sessionId } = get();
    if (sessionId && window.electronAPI) {
      await window.electronAPI.chat.stop(sessionId);
    }
    set({ sessionId: null, isConnected: false, isGenerating: false });
  },

  sendMessage: async () => {
    const { sessionId, inputValue, isGenerating } = get();
    if (!sessionId || !inputValue.trim() || isGenerating || !window.electronAPI) return;

    const content = inputValue.trim();
    set({ inputValue: '' });

    // Add user message
    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      blocks: [{ type: 'text', text: content }],
      timestamp: Date.now(),
      isStreaming: false,
    };
    set((s) => ({ messages: [...s.messages, userMsg] }));

    // Add placeholder for assistant response
    const assistantMsg: ChatMessage = {
      id: newId(),
      role: 'assistant',
      blocks: [{ type: 'text', text: '' }],
      timestamp: Date.now(),
      isStreaming: true,
    };
    set((s) => ({ messages: [...s.messages, assistantMsg], isGenerating: true }));

    await window.electronAPI.chat.send(sessionId, content);
  },

  interrupt: async () => {
    const { sessionId } = get();
    if (sessionId && window.electronAPI) {
      await window.electronAPI.chat.interrupt(sessionId);
    }
  },

  _addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  _updateMessage: (id, fn) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? fn(m) : m)),
    })),

  _setGenerating: (v) => set({ isGenerating: v }),
  _setConnected: (v) => set({ isConnected: v }),

  _appendToLastBlock: (role, text) => {
    set((s) => {
      const msgs = [...s.messages];
      // Find the last streaming message of the given role
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === role && msgs[i].isStreaming) {
          const blocks = [...msgs[i].blocks];
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock && lastBlock.type === 'text') {
            blocks[blocks.length - 1] = {
              ...lastBlock,
              text: lastBlock.text + text,
            };
          } else {
            blocks.push({ type: 'text', text });
          }
          msgs[i] = { ...msgs[i], blocks };
          return { messages: msgs };
        }
      }
      return { messages: msgs };
    });
  },

  _startToolBlock: (id, name, blockIndex) => {
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant' && msgs[i].isStreaming) {
          const blocks = [...msgs[i].blocks];
          blocks.push({
            type: 'tool_use',
            id,
            name,
            input: '',
            status: 'pending',
            collapsed: false,
          });
          msgs[i] = { ...msgs[i], blocks };
          return { messages: msgs };
        }
      }
      return { messages: msgs };
    });
  },

  _appendToolInput: (text) => {
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant' && msgs[i].isStreaming) {
          const blocks = [...msgs[i].blocks];
          for (let j = blocks.length - 1; j >= 0; j--) {
            const b = blocks[j];
            if (b.type === 'tool_use' && (b.status === 'pending' || b.status === 'running')) {
              blocks[j] = { ...b, input: b.input + text, status: 'running' };
              msgs[i] = { ...msgs[i], blocks };
              return { messages: msgs };
            }
          }
        }
      }
      return { messages: msgs };
    });
  },

  _finishStreaming: (usage, cost) => {
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant' && msgs[i].isStreaming) {
          msgs[i] = { ...msgs[i], isStreaming: false, usage, cost };
          return { messages: msgs, isGenerating: false };
        }
      }
      return { messages: msgs, isGenerating: false };
    });
  },

  _addSystemMessage: (text) => {
    const msg: ChatMessage = {
      id: newId(),
      role: 'system',
      blocks: [{ type: 'text', text }],
      timestamp: Date.now(),
      isStreaming: false,
    };
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  _handleToolProgress: (toolId, status, output) => {
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          const blocks = [...msgs[i].blocks];
          for (let j = blocks.length - 1; j >= 0; j--) {
            const b = blocks[j];
            if (b.type === 'tool_use' && b.id === toolId) {
              const newStatus = status === 'done' ? 'done' : status === 'error' ? 'error' : 'running';
              blocks[j] = { ...b, status: newStatus, output: output || b.output };
              msgs[i] = { ...msgs[i], blocks };
              return { messages: msgs };
            }
          }
        }
      }
      return { messages: msgs };
    });
  },
}));
