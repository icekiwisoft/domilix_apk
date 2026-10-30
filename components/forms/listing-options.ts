import type { IconName } from '@/components/ui';
import type { AdType, AnnounceType, Standing } from '@/types/announce';

// Choices shared by the create flow and the edit screen. Labels follow the
// website's publish form (domilix.com PublishForm.tsx, messages/fr.json adForm).

export const TYPE_OPTIONS: readonly { value: AnnounceType; label: string }[] = [
  { value: 'realestate', label: 'Immobilier' },
  { value: 'furniture', label: 'Mobilier' },
];

export const AD_TYPE_OPTIONS: readonly { value: AdType; label: string }[] = [
  { value: 'location', label: 'Location' },
  { value: 'sale', label: 'Vente' },
];

export const DEVISE_OPTIONS: readonly { value: string; label: string }[] = ['FCFA', 'EUR', 'USD'].map((d) => ({
  value: d,
  label: d,
}));

export const STANDING_OPTIONS: readonly { value: Standing; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'confort', label: 'Confort' },
  { value: 'haut_standing', label: 'Haut standing' },
];

export const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'Wifi', icon: 'wifi' },
  { key: 'pool', label: 'Piscine', icon: 'pool' },
  { key: 'air_conditioning', label: 'Clim', icon: 'ac-unit' },
  { key: 'security_24h', label: 'Gardiennage', icon: 'security' },
  { key: 'gate', label: 'Portail', icon: 'lock' },
  { key: 'equipped_kitchen', label: 'Cuisine éq.', icon: 'kitchen' },
  { key: 'smart_tv', label: 'Smart TV', icon: 'tv' },
] as const satisfies readonly { key: string; label: string; icon: IconName }[];

export type AmenityKey = (typeof AMENITY_OPTIONS)[number]['key'];

/** Highest bedroom count offered by the old chips (0 = studio … 5). */
export const MAX_BEDROOMS = 5;
