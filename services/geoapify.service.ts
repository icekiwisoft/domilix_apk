const GEOAPIFY_GEOCODING_URL = 'https://api.geoapify.com/v1/geocode';

export interface GeoapifyAddressSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  place_type: string[];
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  neighborhood?: string;
}

interface GeoapifyFeatureProperties {
  place_id?: string;
  formatted?: string;
  address_line1?: string;
  name?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
  postcode?: string;
  suburb?: string;
  district?: string;
  result_type?: string;
  lon?: number;
  lat?: number;
}

interface GeoapifyResponse {
  features?: {
    geometry?: { coordinates?: [number, number] };
    properties?: GeoapifyFeatureProperties;
  }[];
}

/**
 * Typed failure so screens can tell the causes apart. Every message ends by
 * pointing to manual entry, which always stays possible.
 */
export type GeoapifyErrorKind = 'missing_key' | 'network' | 'quota' | 'not_found' | 'unavailable';

export class GeoapifyError extends Error {
  readonly kind: GeoapifyErrorKind;

  constructor(kind: GeoapifyErrorKind, message: string) {
    super(message);
    this.name = 'GeoapifyError';
    this.kind = kind;
  }
}

const MESSAGES: Record<GeoapifyErrorKind, string> = {
  missing_key:
    "La recherche d'adresse n'est pas disponible dans cette version de l'application. Saisissez l'adresse manuellement.",
  network:
    "Pas de connexion internet. Vérifiez votre réseau ou saisissez l'adresse manuellement.",
  quota:
    "Le service d'adresses est momentanément saturé. Réessayez plus tard ou saisissez l'adresse manuellement.",
  not_found:
    "Aucune adresse n'a été trouvée pour cette position. Saisissez l'adresse manuellement.",
  unavailable:
    "La recherche d'adresse est indisponible. Réessayez dans un instant ou saisissez l'adresse manuellement.",
};

function geoapifyError(kind: GeoapifyErrorKind) {
  return new GeoapifyError(kind, MESSAGES[kind]);
}

function getApiKey() {
  const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
  if (!apiKey) throw geoapifyError('missing_key');
  return apiKey;
}

function toSuggestion(feature: NonNullable<GeoapifyResponse['features']>[number]): GeoapifyAddressSuggestion | null {
  const properties = feature.properties ?? {};
  const longitude = feature.geometry?.coordinates?.[0] ?? properties.lon;
  const latitude = feature.geometry?.coordinates?.[1] ?? properties.lat;

  if (
    typeof longitude !== 'number' ||
    typeof latitude !== 'number' ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude)
  ) {
    return null;
  }

  const city = properties.city ?? properties.town ?? properties.village ?? properties.municipality;
  const text = properties.address_line1 ?? properties.name ?? properties.formatted ?? '';
  const placeName = properties.formatted ?? [text, city, properties.country].filter(Boolean).join(', ');

  return {
    id: properties.place_id ?? `${longitude},${latitude},${placeName}`,
    place_name: placeName,
    text,
    center: [longitude, latitude],
    place_type: properties.result_type ? [properties.result_type] : [],
    city,
    state: properties.state,
    country: properties.country,
    postal_code: properties.postcode,
    neighborhood: properties.suburb ?? properties.district,
  };
}

async function request(path: string, params: Record<string, string | number>, signal?: AbortSignal) {
  const url = new URL(`${GEOAPIFY_GEOCODING_URL}/${path}`);
  url.search = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    apiKey: getApiKey(),
  }).toString();

  let response: Response;
  try {
    response = await fetch(url.toString(), { signal });
  } catch (err) {
    // Cancellation (new keystroke, unmount) is not a failure to report.
    if (signal?.aborted) throw err;
    throw geoapifyError('network');
  }
  if (response.status === 429) throw geoapifyError('quota');
  if (!response.ok) throw geoapifyError('unavailable');

  return response.json() as Promise<GeoapifyResponse>;
}

export const GeoapifyService = {
  async search(query: string, signal?: AbortSignal, type?: 'city') {
    const response = await request(
      'autocomplete',
      { text: query, filter: 'countrycode:cm', lang: 'fr', limit: 5, ...(type ? { type } : {}) },
      signal
    );

    return (response.features ?? [])
      .map(toSuggestion)
      .filter((suggestion): suggestion is GeoapifyAddressSuggestion => suggestion !== null);
  },

  async reverseGeocode(longitude: number, latitude: number, signal?: AbortSignal) {
    const response = await request(
      'reverse',
      { lon: longitude, lat: latitude, lang: 'fr', limit: 1 },
      signal
    );

    const suggestion = response.features?.map(toSuggestion).find((item) => item !== null);
    if (!suggestion) throw geoapifyError('not_found');
    return suggestion;
  },
};
