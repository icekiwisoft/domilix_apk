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

// `value` is the ISO code the backend accepts (AD_DEVISES in ads.service.ts);
// "FCFA" was not one and was saved as XOF, the West African franc. XAF is
// shown as FCFA, like on the website (utils/currencies.ts).
export const DEVISE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'XAF', label: 'FCFA' },
  { value: 'EUR', label: 'EUR' },
  { value: 'USD', label: 'USD' },
];

/** Label of a currency code: XAF is shown as FCFA. */
export function deviseLabel(code: string) {
  return code === 'XAF' ? 'FCFA' : code;
}

/** Most photos of a listing (backend MAX_AD_MEDIAS, website MAX_ANNOUNCE_MEDIAS). */
export const MAX_LISTING_MEDIAS = 15;

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
] as const satisfies readonly { key: string; label: string; spoken: string; icon: IconName }[];

export type AmenityKey = (typeof AMENITY_OPTIONS)[number]['key'];

/** Highest bedroom count offered by the old chips (0 = studio … 5). */
export const MAX_BEDROOMS = 5;
