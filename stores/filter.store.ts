import { create } from 'zustand';
import type { AnnounceFilters } from '@/types/announce';

/**
 * Explore criteria. Unset `type` means Immobilier; unset `ad_type` means rentals
 * and sales together ("Tout" in the filter sheet), as on the website's search.
 */
export type ExploreFilters = AnnounceFilters & {
  /**
   * Display name of `city` when it comes from a home city chip ("Yaoundé"); `city`
   * holds the API's `city_normalized` ("yaounde"). Never sent to the API.
   */
  cityLabel?: string;
};

interface FilterState {
  filters: ExploreFilters;
  setFilter: <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K] | undefined) => void;
  setFilters: (patch: Partial<ExploreFilters>) => void;
  /** Replaces every criterion: the list shows exactly these (home "Tout voir", city chips). */
  replaceFilters: (filters: ExploreFilters) => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: ExploreFilters = {};

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

  replaceFilters: (filters) => set({ filters: { ...filters, page: undefined } }),

  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
}));

/** API query of the explore list and map: Immobilier by default, no ad_type for "Tout". */
export function toAnnounceQuery(f: ExploreFilters): AnnounceFilters {
  const { search, cityLabel: _cityLabel, ...rest } = f;
  return {
    ...rest,
    type: f.type ?? 'realestate',
    search: search?.trim() || undefined,
  };
}

// Selector: counts active filters (excludes page and orderBy from the count)
const EXCLUDED_FROM_COUNT: (keyof ExploreFilters)[] = ['page', 'orderBy'];

export function selectActiveFiltersCount(state: FilterState): number {
  return Object.entries(state.filters)
    .filter(([key, value]) => {
      if (EXCLUDED_FROM_COUNT.includes(key as keyof ExploreFilters)) return false;
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    })
    .length;
}
