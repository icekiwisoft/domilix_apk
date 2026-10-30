import { client } from './api.client';
import type { Announce, AnnounceFilters, PaginatedResponse } from '@/types/announce';

/**
 * One row of GET /cities (backend `AdsService.cities`): listings grouped by
 * normalised city and country, so a city can come back once per country.
 */
export interface CityCount {
  city: string;
  city_normalized: string;
  country: string;
  country_normalized: string;
  ads_count: number;
}

/** Body of PUT /announces/:id, field names as read by the backend (AdsService.updateAd). */
export interface AnnounceUpdate {
  description: string;
  price: number;
  ad_type: string;
  category_id: string | null;
  devise: string;
  media_ids: string[];
  address: string;
  city: string;
  bedroom?: number;
  size?: number | null;
  standing?: string;
  wifi?: '0' | '1';
  air_conditioning?: '0' | '1';
  security_24h?: '0' | '1';
  smart_tv?: '0' | '1';
  equipped_kitchen?: '0' | '1';
  gate?: '0' | '1';
  pool?: '0' | '1';
}

export const AnnouncesService = {
  list: (filters: AnnounceFilters = {}) =>
    client
      .get<PaginatedResponse<Announce>>('/announces', { params: filters })
      .then((r) => r.data),

  show: (id: string) =>
    client.get<Announce>(`/announces/${id}`).then((r) => r.data),

  create: (formData: FormData) =>
    client
      .post<Announce>('/announces', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  /**
   * PUT /announces/:id takes JSON only (no file interceptor, backend
   * ads.controller.ts): new photos go through UploadsService first, then
   * `media_ids` lists every photo kept, in order, as the website does
   * (EditAdModal.tsx, services/announceApi.ts updateAd).
   */
  update: (id: string, data: AnnounceUpdate) =>
    client.put<Announce>(`/announces/${id}`, data).then((r) => r.data),

  destroy: (id: string) =>
    client.delete(`/announces/${id}`).then((r) => r.data),

  toggleLike: (id: string) =>
    client.patch<{ liked: boolean }>(`/announces/${id}/like`).then((r) => r.data),

  unlock: (id: string) =>
    client.post<Announce>(`/announces/${id}/unlock`).then((r) => r.data),

  cities: (params?: {
    search?: string;
    country?: string;
    ad_type?: string;
    type?: string;
    limit?: string;
    order_by?: 'name' | 'count';
    order?: 'asc' | 'desc';
  }) =>
    client
      .get<{ success: boolean; data: CityCount[] }>('/cities', { params })
      .then((r) => r.data.data ?? []),
};
