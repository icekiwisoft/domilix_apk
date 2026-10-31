import { create } from 'zustand';
import type { AmenityKey } from '@/constants/listing';
import type { PickedMedia } from '@/services/uploads.service';
import type { AdType, LandUse, Standing } from '@/types/announce';

export type CreatableType = 'realestate' | 'furniture' | 'land';

// Same fields as the draft of the domilix.com publish dialog.
export interface CreateListingDraft {
  // Step 1 — type, category, mode
  type: CreatableType;
  category_id: string;
  ad_type: AdType;

  // Step 2 — characteristics
  bedroom: number;
  mainroom: number;
  toilet: number;
  kitchen: number;
  size: string;
  standing: Standing;
  amenities: Record<AmenityKey, boolean>;
  // furniture
  condition: 'used' | 'new';
  height: string;
  width: string;
  length: string;
  weight: string;
  // land
  land_use: LandUse;
  land_title: boolean;

  // Step 3 — location & photos
  location_source: 'auto' | 'manual';
  hide_on_map: boolean;
  address: string;
  neighbourhood: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  longitude?: number;
  latitude?: number;
  medias: PickedMedia[];

  // Step 4 — price & description
  price: string;
  devise: string;
  period: string;
  description: string;
  contact_phone: string;
  contact_email: string;
}

const NO_AMENITIES: Record<AmenityKey, boolean> = {
  wifi: false,
  pool: false,
  air_conditioning: false,
  security_24h: false,
  gate: false,
  equipped_kitchen: false,
  smart_tv: false,
  furnitured: false,
  garage: false,
  garden: false,
};

const DEFAULT_DRAFT: CreateListingDraft = {
  type: 'realestate',
  category_id: '',
  ad_type: 'location',

  bedroom: 0,
  mainroom: 0,
  toilet: 0,
  kitchen: 0,
  size: '',
  standing: 'standard',
  amenities: NO_AMENITIES,
  condition: 'used',
  height: '',
  width: '',
  length: '',
  weight: '',
  land_use: 'residential',
  land_title: false,

  location_source: 'auto',
  hide_on_map: false,
  address: '',
  neighbourhood: '',
  city: '',
  state: '',
  country: '',
  zip: '',
  longitude: undefined,
  latitude: undefined,
  medias: [],

  price: '',
  devise: 'XAF',
  period: 'month',
  description: '',
  contact_phone: '',
  contact_email: '',
};

/** True while nothing was entered since the last reset (the flow can start fresh silently). */
export function isDraftEmpty(draft: CreateListingDraft) {
  // Step 1 selects the first category by itself: that alone is not a draft.
  return JSON.stringify({ ...draft, category_id: '' }) === JSON.stringify(DEFAULT_DRAFT);
}

interface CreateListingStore {
  draft: CreateListingDraft;
  setDraft: (patch: Partial<CreateListingDraft>) => void;
  toggleAmenity: (key: AmenityKey) => void;
  resetDraft: () => void;
}

export const useCreateListingStore = create<CreateListingStore>((set) => ({
  draft: { ...DEFAULT_DRAFT, amenities: { ...NO_AMENITIES } },
  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  toggleAmenity: (key) =>
    set((s) => ({
      draft: { ...s.draft, amenities: { ...s.draft.amenities, [key]: !s.draft.amenities[key] } },
    })),
  resetDraft: () => set({ draft: { ...DEFAULT_DRAFT, amenities: { ...NO_AMENITIES } } }),
}));
