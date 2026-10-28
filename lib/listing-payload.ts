import { AMENITY_OPTIONS } from '@/constants/listing';
import type { CreateListingDraft } from '@/stores/create-listing.store';
import type { UploadResponse } from '@/types/verification';

// Body of POST /announces, field for field the one the domilix.com publish
// dialog sends (ArticlePostDialog.handleSubmit).
export function buildCreatePayload(draft: CreateListingDraft, medias: UploadResponse[]) {
  const isManual = draft.location_source === 'manual';
  const isLand = draft.type === 'land';
  const flag = (value: boolean) => (value ? '1' : '0');

  const amenities = Object.fromEntries(
    AMENITY_OPTIONS.map(({ key }) => [key, flag(draft.amenities[key])])
  );

  return {
    category_id: draft.category_id,
    price: draft.price,
    type: draft.type,
    ad_type: draft.ad_type,
    bedroom: String(draft.bedroom),
    mainroom: String(draft.mainroom),
    toilet: String(draft.toilet),
    kitchen: String(draft.kitchen),
    size: draft.size || '0',
    standing: draft.standing,
    height: draft.height || '0',
    width: draft.width || '0',
    length: draft.length || '0',
    weight: draft.weight || '0',
    condition: draft.condition,
    ...amenities,
    // For land, the "gate" amenity above stands for "Clôturé".
    ...(isLand ? { land_use: draft.land_use, land_title: flag(draft.land_title) } : {}),
    period: draft.ad_type === 'location' ? draft.period : '',
    description: draft.description,
    contact_phone: draft.contact_phone,
    contact_email: draft.contact_email,
    devise: draft.devise,
    address: draft.address,
    city: draft.city,
    neighbourhood: draft.neighbourhood,
    state: draft.state,
    country: draft.country,
    zip: draft.zip,
    location_source: draft.location_source,
    hide_on_map: draft.hide_on_map || isManual ? '1' : '0',
    ...(isManual || draft.longitude == null || draft.latitude == null
      ? {}
      : { localization: [String(draft.longitude), String(draft.latitude)] }),
    // Honeypot field of the web form: always empty for real users.
    website: '',
    media_ids: medias.map((m) => m.id),
    media_types: medias.map((m) => m.mime_type),
  };
}
