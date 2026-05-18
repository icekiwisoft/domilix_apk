import { client } from './api.client';

export interface AddressSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  place_type: string[];
}

export const AddressesService = {
  search: (params: {
    query: string;
    proximity?: number[];
    limit?: number;
    types?: string[];
    country?: string;
    language?: string;
    autocomplete?: boolean;
  }) =>
    client
      .get<AddressSuggestion[]>('/addresses/search', { params })
      .then((r) => r.data),

  reverseGeocode: (longitude: number, latitude: number) =>
    client
      .get<AddressSuggestion>('/addresses/reverse-geocode', {
        params: { longitude, latitude },
      })
      .then((r) => r.data),
};
