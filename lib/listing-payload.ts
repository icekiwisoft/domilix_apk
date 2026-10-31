import { AMENITY_OPTIONS, type AmenityKey } from '@/constants/listing';
import type { CreateListingDraft } from '@/stores/create-listing.store';
import type { AdType, Announce, AnnounceType, LandUse, Standing } from '@/types/announce';
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
    // Empty, as on the website: the form shows no postal code, so the
    // Geoapify one the user never saw is not sent (UI-12, QA-19). The backend
    // fills it from the coordinates of an automatic location.
    zip: '',
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

// ─── Edit (PUT /announces/:id) ───────────────────────────────────────────────

export const toText = (value: unknown) => (value === null || value === undefined ? '' : String(value));

/**
 * Form values read from GET /announces/:id, with the field names the API
 * really returns (bedroom, neighbourhood, category.id, postal_code: UI-12).
 */
export function getEditDetails(ad: Announce) {
  return {
    description: toText(ad.description),
    price: toText(ad.price),
    ad_type: (ad.ad_type || 'location') as AdType,
    category_id: toText(ad.category?.id),
    period: toText(ad.period),
    // XOF was what the app used to save for "FCFA": show it as XAF, the Central African franc.
    devise: !ad.devise || ad.devise === 'XOF' ? 'XAF' : ad.devise,
    contact_phone: toText(ad.contact_phone),
    contact_email: toText(ad.contact_email),
    address: toText(ad.address),
    city: toText(ad.city),
    neighbourhood: toText(ad.neighbourhood),
    state: toText(ad.state),
    country: toText(ad.country),
    zip: toText(ad.postal_code),
    bedroom: ad.bedroom ?? 0,
    mainroom: ad.mainroom ?? 0,
    toilet: ad.toilet ?? 0,
    kitchen: ad.kitchen ?? 0,
    size: toText(ad.size),
    caution: toText(ad.caution),
    standing: ad.standing as Standing | undefined,
    height: toText(ad.height),
    width: toText(ad.width),
    length: toText(ad.length),
    weight: toText(ad.weight),
    condition: (ad.condition || 'used') as 'used' | 'new',
    land_use: (ad.land_use || 'residential') as LandUse,
    land_title: !!ad.land_title,
  };
}

export type EditDetails = ReturnType<typeof getEditDetails>;

export function getEditAmenities(ad: Announce): Record<AmenityKey, boolean> {
  return {
    wifi: !!ad.wifi,
    pool: !!ad.pool,
    air_conditioning: !!ad.air_conditioning,
    security_24h: !!ad.security_24h,
    gate: !!ad.gate,
    equipped_kitchen: !!ad.equipped_kitchen,
    smart_tv: !!ad.smart_tv,
    furnitured: !!ad.furnitured,
    garage: !!ad.garage,
    garden: !!ad.garden,
  };
}

const flag = (value: boolean) => (value ? '1' : '0');
const orNull = (text: string) => (text ? Number(text) : null);

/** Amenities of the edit form: the publish ones plus "Jardin" (website EditAdModal). */
const EDIT_AMENITY_KEYS: AmenityKey[] = [...AMENITY_OPTIONS.map((a) => a.key), 'garden'];

/**
 * JSON body of PUT /announces/:id, field for field the website's edit dialog
 * (domilix.com EditAdModal.tsx), with the names AdsService.updateAd reads.
 * `media_ids` is added by useUpdateAnnounce once the new medias are uploaded.
 */
export function buildUpdatePayload(
  type: AnnounceType,
  details: EditDetails,
  amenities: Record<AmenityKey, boolean>,
  location: { manualAddress: boolean; coordinates: { longitude: number; latitude: number } | null }
): Record<string, unknown> {
  const { manualAddress, coordinates } = location;
  const typeFields =
    type === 'land'
      ? {
          size: orNull(details.size),
          land_use: details.land_use || 'residential',
          land_title: flag(details.land_title),
          gate: flag(amenities.gate),
        }
      : type === 'realestate'
        ? {
            bedroom: details.bedroom,
            mainroom: details.mainroom,
            toilet: details.toilet,
            kitchen: details.kitchen,
            size: orNull(details.size),
            caution: orNull(details.caution),
            // The website's dialog has no standing field; the app kept it (UI-12): sent only when set.
            ...(details.standing ? { standing: details.standing } : {}),
            ...Object.fromEntries(EDIT_AMENITY_KEYS.map((key) => [key, flag(amenities[key])])),
          }
        : {
            condition: details.condition || 'used',
            height: orNull(details.height),
            width: orNull(details.width),
            length: orNull(details.length),
            weight: orNull(details.weight),
          };

  return {
    description: details.description,
    price: Number(details.price),
    ad_type: details.ad_type,
    category_id: details.category_id || null,
    period: details.ad_type === 'location' ? details.period : '',
    devise: details.devise,
    contact_phone: details.contact_phone,
    contact_email: details.contact_email,
    address: details.address,
    city: details.city,
    neighbourhood: details.neighbourhood,
    state: details.state,
    country: details.country,
    zip: details.zip,
    location_source: manualAddress ? 'manual' : 'auto',
    hide_on_map: manualAddress ? '1' : '0',
    ...(!manualAddress && coordinates
      ? { localization: [String(coordinates.longitude), String(coordinates.latitude)] }
      : {}),
    ...typeFields,
  };
}
