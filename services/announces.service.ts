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

export const AnnouncesService = {
  list: (filters: AnnounceFilters = {}) =>
    client
      .get<PaginatedResponse<Announce>>('/announces', { params: filters })
      .then((r) => r.data),

  show: (id: string) =>
    client.get<Announce>(`/announces/${id}`).then((r) => r.data),

  // Same JSON body as the website: photos/videos are uploaded beforehand
  // (POST /uploads) and referenced through `media_ids`.
  create: (payload: Record<string, unknown>) =>
    client.post<Announce>('/announces', payload).then((r) => r.data),

  /**
   * PUT /announces/:id takes JSON only (no file interceptor, backend
   * ads.controller.ts): new photos go through UploadsService first, then
   * `media_ids` lists every photo kept, in order, as the website does
   * (EditAdModal.tsx, services/announceApi.ts updateAd).
   */
  update: (id: string, payload: Record<string, unknown>) =>
    client.put<Announce>(`/announces/${id}`, payload).then((r) => r.data),

  destroy: (id: string) =>
    client.delete(`/announces/${id}`).then((r) => r.data),

  toggleLike: (id: string) =>
    client.patch<{ liked: boolean }>(`/announces/${id}/like`).then((r) => r.data),

  unlock: (id: string) =>
    client.post<Announce>(`/announces/${id}/unlock`).then((r) => r.data),

  // Reports a listing to the Domilix moderation team (auth required, 5/min).
  report: (id: string, dto: { reason: string; details?: string }) =>
    client
      .post<{ message?: string }>(`/announces/${id}/reports`, dto)
      .then((r) => r.data),

  // Counts a view; deduplicated server-side. Never block the UI on it.
  markSeen: (id: string) =>
    client.post(`/announces/${id}/see`).then((r) => r.data).catch(() => undefined),

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
