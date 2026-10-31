import type { IconName } from '@/components/ui';
import type { AmenityKey } from '@/constants/listing';
import type { AdType, AnnounceType, Standing } from '@/types/announce';

// Choices shared by the create flow and the edit screen. Labels follow the
// website's publish form (domilix.com PublishForm.tsx, messages/fr.json adForm).

/** Name and icon of each property type (recaps, banners). */
export const TYPE_LABELS: Record<AnnounceType, { label: string; icon: IconName }> = {
  realestate: { label: 'Immobilier', icon: 'home-work' },
  land: { label: 'Terrain', icon: 'square-foot' },
  furniture: { label: 'Mobilier', icon: 'chair' },
};

export const AD_TYPE_OPTIONS: readonly { value: AdType; label: string }[] = [
  { value: 'location', label: 'Location' },
  { value: 'sale', label: 'Vente' },
];

/**
 * Label of a currency code: XAF is shown as FCFA, as on the website. The codes
 * are the ISO ones the backend accepts (AD_DEVISES); "FCFA" was not one and
 * was saved as XOF, the West African franc (UI-12). Full list: constants/listing.
 */
export function deviseLabel(code: string) {
  return code === 'XAF' ? 'FCFA' : code;
}

export const STANDING_OPTIONS: readonly { value: Standing; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'confort', label: 'Confort' },
  { value: 'haut_standing', label: 'Haut standing' },
];

// `spoken`: full name read by TalkBack (website adForm.fields.amenities) where
// the chip label is the form's short one ("Clim", "Cuisine éq.").
export const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'Wifi', spoken: 'Wifi', icon: 'wifi' },
  { key: 'pool', label: 'Piscine', spoken: 'Piscine', icon: 'pool' },
  { key: 'air_conditioning', label: 'Clim', spoken: 'Climatisation', icon: 'ac-unit' },
  { key: 'security_24h', label: 'Gardiennage', spoken: 'Gardiennage', icon: 'security' },
  { key: 'gate', label: 'Portail', spoken: 'Portail', icon: 'lock' },
  { key: 'equipped_kitchen', label: 'Cuisine éq.', spoken: 'Cuisine équipée', icon: 'kitchen' },
  { key: 'smart_tv', label: 'Smart TV', spoken: 'Smart TV', icon: 'tv' },
  { key: 'furnitured', label: 'Meublé', spoken: 'Meublé', icon: 'weekend' },
  { key: 'garage', label: 'Garage', spoken: 'Garage', icon: 'garage' },
] as const satisfies readonly AmenityOption[];

/** The edit screen also offers "Jardin", as the website's edit dialog does. */
export const EDIT_AMENITY_OPTIONS: readonly AmenityOption[] = [
  ...AMENITY_OPTIONS,
  { key: 'garden', label: 'Jardin', spoken: 'Jardin', icon: 'yard' },
];

export interface AmenityOption {
  key: AmenityKey;
  label: string;
  spoken: string;
  icon: IconName;
}

export type { AmenityKey };

/** Most rooms of one kind offered by the steppers (bedrooms, living rooms, toilets, kitchens). */
export const MAX_ROOMS = 20;
