import { create } from 'zustand';

interface UIState {
  // Fullscreen loading overlay (for blocking operations like payment)
  loadingOverlay: boolean;
  loadingMessage?: string;
  showLoadingOverlay: (message?: string) => void;
  hideLoadingOverlay: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  loadingOverlay: false,
  loadingMessage: undefined,

  showLoadingOverlay: (message) =>
    set({ loadingOverlay: true, loadingMessage: message }),

  hideLoadingOverlay: () =>
    set({ loadingOverlay: false, loadingMessage: undefined }),
}));
