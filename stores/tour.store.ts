import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Guided tours already shown on this device (see components/tour).
interface TourState {
  seen: string[];
  hydrated: boolean;
  markSeen: (tourId: string) => void;
  reset: () => void;
}

export const useTourStore = create<TourState>()(persist((set) => ({
  seen: [],
  hydrated: false,
  markSeen: (tourId) => set((state) => ({ seen: state.seen.includes(tourId) ? state.seen : [...state.seen, tourId] })),
  reset: () => set({ seen: [] }),
}), {
  name: 'domilix-guided-tours',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({ seen: state.seen }),
  onRehydrateStorage: () => () => useTourStore.setState({ hydrated: true }),
}));
