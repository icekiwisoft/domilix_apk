import { create } from 'zustand';
import type { AnnounceFilters } from '@/types/announce';

interface FilterState {
  filters: AnnounceFilters;
  setFilter: <K extends keyof AnnounceFilters>(key: K, value: AnnounceFilters[K] | undefined) => void;
  setFilters: (patch: Partial<AnnounceFilters>) => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: AnnounceFilters = {};

export const useFilterStore = create<FilterState>((set) => ({
  filters: DEFAULT_FILTERS,

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: undefined },
    })),

  setFilters: (patch) =>
    set((state) => ({
      filters: { ...state.filters, ...patch, page: undefined },
    })),

  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
}));

// Selector: counts active filters (excludes page and orderBy from the count)
const EXCLUDED_FROM_COUNT: (keyof AnnounceFilters)[] = ['page', 'orderBy'];

export function selectActiveFiltersCount(state: FilterState): number {
  return Object.entries(state.filters)
    .filter(([key, value]) => {
      if (EXCLUDED_FROM_COUNT.includes(key as keyof AnnounceFilters)) return false;
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    })
    .length;
}
