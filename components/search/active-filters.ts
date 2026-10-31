import { formatAmount, periodLabel, type IconName } from '@/components/ui';
import type { ExploreFilters } from '@/stores/filter.store';
import type { LandUse, Standing } from '@/types/announce';

export const AMENITY_OPTIONS: { value: string; label: string; icon: IconName }[] = [
  { value: 'wifi', label: 'Wifi', icon: 'wifi' },
  { value: 'pool', label: 'Piscine', icon: 'pool' },
  { value: 'air_conditioning', label: 'Climatisation', icon: 'ac-unit' },
  { value: 'security_24h', label: 'Gardiennage', icon: 'security' },
  { value: 'gate', label: 'Portail', icon: 'lock' },
  { value: 'equipped_kitchen', label: 'Cuisine équipée', icon: 'kitchen' },
];

export const STANDING_OPTIONS: { value: Standing; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'confort', label: 'Confort' },
  { value: 'haut_standing', label: 'Haut standing' },
];

export const LAND_USE_OPTIONS: { value: LandUse; label: string }[] = [
  { value: 'residential', label: 'Habitation' },
  { value: 'agricultural', label: 'Agricole' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industriel' },
];

export interface ActiveFilter {
  key: string;
  label: string;
  /** The filters once this one is removed. */
  remove: (f: ExploreFilters) => Partial<ExploreFilters>;
}

const fcfa = (v: number) => `${formatAmount(v)} FCFA`;

/**
 * Display name of a city filter. The home city chips filter on the API's
 * `city_normalized` ("yaounde") and store the backend's own name ("Yaoundé")
 * as `cityLabel`; without it, the normalised name is capitalised.
 */
export function cityLabel(f: Pick<ExploreFilters, 'city' | 'cityLabel'>): string | undefined {
  if (!f.city) return undefined;
  return f.cityLabel || f.city.replace(/(^|[\s-])(\p{L})/gu, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}

/**
 * Filters the user chose, as removable chips (explore header) and as the
 * count on the filter button. The defaults (Immobilier, rentals and sales) are not
 * listed: only what narrows the results.
 */
export function activeFilters(f: ExploreFilters): ActiveFilter[] {
  const out: ActiveFilter[] = [];
  if (f.type === 'furniture') out.push({ key: 'type', label: 'Mobilier', remove: () => ({ type: undefined }) });
  if (f.type === 'land') out.push({ key: 'type', label: 'Terrain', remove: () => ({ type: undefined }) });
  if (f.recommended) out.push({ key: 'recommended', label: 'Recommandations', remove: () => ({ recommended: undefined }) });
  if (f.ad_type === 'sale') out.push({ key: 'ad_type', label: 'À vendre', remove: () => ({ ad_type: undefined }) });
  if (f.ad_type === 'location') out.push({ key: 'ad_type', label: 'À louer', remove: () => ({ ad_type: undefined }) });
  if (f.period === 'night') out.push({ key: 'period', label: 'À la nuit', remove: () => ({ period: undefined }) });
  else if (f.period) out.push({ key: 'period', label: `Par ${periodLabel(f.period) ?? f.period}`, remove: () => ({ period: undefined }) });
  if (f.city) out.push({ key: 'city', label: cityLabel(f) ?? f.city, remove: () => ({ city: undefined, cityLabel: undefined }) });
  if (f.budget_min) out.push({ key: 'budget_min', label: `À partir de ${fcfa(f.budget_min)}`, remove: () => ({ budget_min: undefined }) });
  if (f.budget_max) out.push({ key: 'budget_max', label: `Jusqu’à ${fcfa(f.budget_max)}`, remove: () => ({ budget_max: undefined }) });
  if (f.bedroom_min) {
    const n = f.bedroom_min;
    out.push({ key: 'bedroom_min', label: `${n} chambre${n > 1 ? 's' : ''} et +`, remove: () => ({ bedroom_min: undefined }) });
  }
  if (f.standing) {
    const label = STANDING_OPTIONS.find((o) => o.value === f.standing)?.label ?? f.standing;
    out.push({ key: 'standing', label, remove: () => ({ standing: undefined }) });
  }
  if (f.size_min) out.push({ key: 'size_min', label: `À partir de ${formatAmount(f.size_min)} m²`, remove: () => ({ size_min: undefined }) });
  if (f.size_max) out.push({ key: 'size_max', label: `Jusqu’à ${formatAmount(f.size_max)} m²`, remove: () => ({ size_max: undefined }) });
  if (f.land_use) {
    const label = LAND_USE_OPTIONS.find((o) => o.value === f.land_use)?.label ?? f.land_use;
    out.push({ key: 'land_use', label, remove: () => ({ land_use: undefined }) });
  }
  if (f.land_title) out.push({ key: 'land_title', label: 'Titre foncier', remove: () => ({ land_title: undefined }) });
  for (const a of f.amenities ?? []) {
    const label = AMENITY_OPTIONS.find((o) => o.value === a)?.label ?? a;
    out.push({
      key: `amenity-${a}`,
      label,
      remove: (cur) => {
        const rest = (cur.amenities ?? []).filter((x) => x !== a);
        return { amenities: rest.length ? rest : undefined };
      },
    });
  }
  return out;
}
