import type { MaterialIcons } from '@expo/vector-icons';
import type { LandUse, Standing } from '@/types/announce';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

// Mirrors domilix.com (src/utils/currencies.ts, src/utils/land.ts and the
// publish dialog) so a listing can be created identically on both apps.

export const MAX_MEDIAS = 15;

// Must match LAND_UNLOCK_COST in backend/src/ads/ads.service.ts.
export const LAND_UNLOCK_COST = 6;

export const AD_CURRENCIES = [
  { key: 'XAF', name: 'FCFA' },
  { key: 'XOF', name: 'Franc CFA (BCEAO)' },
  { key: 'USD', name: 'Dollar américain' },
  { key: 'EUR', name: 'Euro' },
  { key: 'GBP', name: 'Livre sterling' },
  { key: 'NGN', name: 'Naira nigérian' },
  { key: 'GHS', name: 'Cedi ghanéen' },
  { key: 'KES', name: 'Shilling kenyan' },
  { key: 'ZAR', name: 'Rand sud-africain' },
  { key: 'MAD', name: 'Dirham marocain' },
  { key: 'DZD', name: 'Dinar algérien' },
  { key: 'TND', name: 'Dinar tunisien' },
  { key: 'EGP', name: 'Livre égyptienne' },
  { key: 'ETB', name: 'Birr éthiopien' },
  { key: 'UGX', name: 'Shilling ougandais' },
  { key: 'TZS', name: 'Shilling tanzanien' },
  { key: 'RWF', name: 'Franc rwandais' },
  { key: 'BIF', name: 'Franc burundais' },
  { key: 'CDF', name: 'Franc congolais' },
  { key: 'AOA', name: 'Kwanza angolais' },
  { key: 'ZMW', name: 'Kwacha zambien' },
  { key: 'MZN', name: 'Metical mozambicain' },
  { key: 'BWP', name: 'Pula botswanais' },
  { key: 'NAD', name: 'Dollar namibien' },
] as const;

// Codes the backend accepts (AD_DEVISES in backend/src/ads/ads.service.ts,
// checked 2026-10-31); the picker offers the African ones and the main others.
export const BACKEND_DEVISES = [
  'USD', 'EUR', 'GBP', 'XOF', 'XAF', 'NGN', 'KES', 'GHS', 'ZAR', 'MAD', 'DZD', 'TND', 'EGP',
  'ETB', 'UGX', 'TZS', 'RWF', 'BIF', 'CDF', 'AOA', 'ZMW', 'MZN', 'BWP', 'NAD', 'JPY', 'CNY',
  'INR', 'BRL', 'RUB', 'CAD', 'AUD', 'CHF', 'SGD', 'NZD', 'MXN', 'TRY', 'AED', 'SAR',
] as const;

/**
 * Currency of a listing as the edit form should keep it: any code the backend
 * knows stays as is (XOF included); an unknown value ("FCFA", empty) becomes XAF.
 */
export function knownDevise(devise: string | null | undefined): string {
  const code = (devise ?? '').trim().toUpperCase();
  return (BACKEND_DEVISES as readonly string[]).includes(code) ? code : 'XAF';
}

export const CURRENCY_OPTIONS = AD_CURRENCIES.map((c) => ({
  value: c.key as string,
  label: `${c.key} (${c.name})`,
}));

export const PERIOD_OPTIONS = [
  { value: 'hour', label: 'Heure' },
  { value: 'day', label: 'Jour' },
  { value: 'night', label: 'Nuit' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
] as const;

export const LAND_USE_OPTIONS: { value: LandUse; label: string }[] = [
  { value: 'residential', label: 'Habitation' },
  { value: 'agricultural', label: 'Agricole' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industriel' },
];

export const STANDING_OPTIONS: { value: Standing; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'confort', label: 'Confort' },
  { value: 'haut_standing', label: 'Haut standing' },
];

export type AmenityKey =
  | 'wifi'
  | 'pool'
  | 'air_conditioning'
  | 'security_24h'
  | 'gate'
  | 'equipped_kitchen'
  | 'smart_tv'
  | 'furnitured'
  | 'garage'
  | 'garden';

// Amenities offered when publishing real estate (same list as the web form).
export const AMENITY_OPTIONS: { key: AmenityKey; label: string; icon: IconName }[] = [
  { key: 'wifi', label: 'Wifi', icon: 'wifi' },
  { key: 'pool', label: 'Piscine', icon: 'pool' },
  { key: 'air_conditioning', label: 'Clim', icon: 'ac-unit' },
  { key: 'security_24h', label: 'Gardiennage', icon: 'security' },
  { key: 'gate', label: 'Portail', icon: 'lock' },
  { key: 'equipped_kitchen', label: 'Cuisine éq.', icon: 'kitchen' },
  { key: 'smart_tv', label: 'Smart TV', icon: 'tv' },
  { key: 'furnitured', label: 'Meublé', icon: 'weekend' },
  { key: 'garage', label: 'Garage', icon: 'garage' },
];

export function currencyLabel(key: string): string {
  return AD_CURRENCIES.find((c) => c.key === key)?.name ?? key;
}
