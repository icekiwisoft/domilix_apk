import type { AlertFilters } from '@/types/alert';
import type { AnnounceFilters } from '@/types/announce';

const AD_TYPE_LABELS: Record<string, string> = { location: 'Location', sale: 'Vente' };
const STANDING_LABELS: Record<string, string> = {
  standard: 'Standard',
  confort: 'Confort',
  haut_standing: 'Haut standing',
};

// Short human-readable chips describing what an alert is watching.
export function describeAlertFilters(filters: AlertFilters): string[] {
  const chips: string[] = [];
  if (filters.search) chips.push(filters.search);
  if (filters.city) chips.push(filters.city);
  if (filters.address) chips.push(filters.address);
  if (filters.ad_type) chips.push(AD_TYPE_LABELS[filters.ad_type] ?? filters.ad_type);

  const currency = filters.budget_currency ?? 'XAF';
  if (filters.budget_min && filters.budget_max) {
    chips.push(`${filters.budget_min} – ${filters.budget_max} ${currency}`);
  } else if (filters.budget_min) {
    chips.push(`≥ ${filters.budget_min} ${currency}`);
  } else if (filters.budget_max) {
    chips.push(`≤ ${filters.budget_max} ${currency}`);
  }

  if (filters.bedroom_min || filters.bedroom_max) {
    chips.push(`${filters.bedroom_min ?? 0}–${filters.bedroom_max ?? '+'} ch.`);
  }
  if (filters.standing) chips.push(STANDING_LABELS[filters.standing] ?? filters.standing);
  if (filters.amenities?.length) {
    chips.push(`${filters.amenities.length} équipement${filters.amenities.length > 1 ? 's' : ''}`);
  }
  return chips;
}

// Maps the mobile search state to the filter set the alerts API accepts
// (strings only; empty values are dropped).
export function announceFiltersToAlertFilters(
  filters: AnnounceFilters,
  extra: { search?: string; ad_type?: string }
): AlertFilters {
  const out: AlertFilters = {};
  const search = extra.search?.trim();
  if (search) out.search = search;
  if (filters.city) out.city = filters.city;
  if (filters.address) out.address = filters.address;
  const adType = extra.ad_type ?? filters.ad_type;
  if (adType) out.ad_type = adType;
  if (filters.category_id?.length) out.category_id = filters.category_id;
  if (filters.budget_min != null) out.budget_min = String(filters.budget_min);
  if (filters.budget_max != null) out.budget_max = String(filters.budget_max);
  if (filters.standing) out.standing = filters.standing;
  if (filters.bedroom_min != null) out.bedroom_min = String(filters.bedroom_min);
  if (filters.bedroom_max != null) out.bedroom_max = String(filters.bedroom_max);
  if (filters.amenities?.length) out.amenities = filters.amenities;
  return out;
}
