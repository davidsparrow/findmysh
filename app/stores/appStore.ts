import { create } from 'zustand';

export type SearchMode = 'chat' | 'manual';

interface AppState {
  searchMode: SearchMode;
  isIndexing: boolean;
  hasIndexedContent: boolean;

  setSearchMode: (mode: SearchMode) => void;
  setIsIndexing: (isIndexing: boolean) => void;
  setHasIndexedContent: (hasContent: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  searchMode: 'chat',
  isIndexing: false,
  hasIndexedContent: false,

  setSearchMode: (mode) => set({ searchMode: mode }),
  setIsIndexing: (isIndexing) => set({ isIndexing }),
  setHasIndexedContent: (hasContent) => set({ hasIndexedContent: hasContent }),
}));
