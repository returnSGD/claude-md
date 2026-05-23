import { create } from 'zustand';

export type ViewMode = 'split' | 'edit-only' | 'preview-only';

interface PreviewStore {
  viewMode: ViewMode;
  scrollRatio: number;
  renderedHtml: string;
  tocItems: { level: number; text: string; line: number }[];

  setViewMode: (mode: ViewMode) => void;
  setScrollRatio: (ratio: number) => void;
  setRenderedHtml: (html: string) => void;
  setTocItems: (items: { level: number; text: string; line: number }[]) => void;
}

export const usePreviewStore = create<PreviewStore>((set) => ({
  viewMode: 'split',
  scrollRatio: 0,
  renderedHtml: '',
  tocItems: [],

  setViewMode: (mode) => set({ viewMode: mode }),
  setScrollRatio: (ratio) => set({ scrollRatio: ratio }),
  setRenderedHtml: (html) => set({ renderedHtml: html }),
  setTocItems: (items) => set({ tocItems: items }),
}));
