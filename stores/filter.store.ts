import { create } from 'zustand';
import type { AdType, AnnounceFilters } from '@/types/announce';

/**
 * Explore criteria. Unset `type` and `ad_type` mean the defaults (Immobilier,
 * À louer); `ad_type: 'all'` lists rentals and sales together (home rows
 * "Nos recommandations" and "Dernières annonces", UI-11).
 */
export type ExploreFilters = Omit<AnnounceFilters, 'ad_type'> & {
  ad_type?: AdType | 'all';
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

/** API query of the explore list and map: defaults applied, `all` sent as no ad_type. */
export function toAnnounceQuery(f: ExploreFilters): AnnounceFilters {
  const { ad_type, search, cityLabel: _cityLabel, ...rest } = f;
  return {
    ...rest,
    type: f.type ?? 'realestate',
    ad_type: ad_type === 'all' ? undefined : (ad_type ?? 'location'),
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
