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

function getApiKey() {
  const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
  if (!apiKey) {
    throw new Error('La clé Geoapify est absente de la configuration de l’application.');
  }
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

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error('La recherche d’adresse est indisponible. Réessayez dans un instant.');
  }

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
    if (!suggestion) {
      throw new Error('Aucune adresse n’a été trouvée pour cette position.');
    }
    return suggestion;
  },
};
