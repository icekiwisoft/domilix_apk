import { create } from 'zustand';
import type { AdType, AnnounceType, Standing } from '@/types/announce';

export interface CreateListingDraft {
  type: AnnounceType;
  ad_type: AdType;
  category_id: string;
  medias: string[];
  price: string;
  devise: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  neighborhood: string;
  longitude?: number;
  latitude?: number;
  location_source: 'auto' | 'manual';
  hide_on_map: boolean;
  bedrooms: number;
  size: string;
  standing: Standing | undefined;
  wifi: boolean;
  air_conditioning: boolean;
  security_24h: boolean;
  equipped_kitchen: boolean;
  gate: boolean;
  pool: boolean;
  smart_tv: boolean;
}

const DEFAULT_DRAFT: CreateListingDraft = {
  type: 'realestate',
  ad_type: 'location',
  category_id: '',
  medias: [],
  price: '',
  devise: 'FCFA',
  description: '',
  address: '',
  city: 'Douala',
  state: '',
  country: 'Cameroun',
  postal_code: '',
  neighborhood: '',
  longitude: undefined,
  latitude: undefined,
  location_source: 'manual',
  hide_on_map: true,
  bedrooms: 0,
  size: '',
  standing: undefined,
  wifi: false,
  air_conditioning: false,
  security_24h: false,
  equipped_kitchen: false,
  gate: false,
  pool: false,
  smart_tv: false,
};

interface CreateListingStore {
  draft: CreateListingDraft;
  setDraft: (patch: Partial<CreateListingDraft>) => void;
  resetDraft: () => void;
}

export const useCreateListingStore = create<CreateListingStore>((set) => ({
  draft: { ...DEFAULT_DRAFT },
  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  resetDraft: () => set({ draft: { ...DEFAULT_DRAFT } }),
}));
