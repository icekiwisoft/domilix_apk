import { client } from './api.client';
import type { Announce, AnnounceFilters, PaginatedResponse } from '@/types/announce';

// The API renamed a few fields since the screens were written (bedroom,
// neighbourhood, zip). Alias them to the names the UI reads so every screen
// keeps working from a single mapping.
function normalizeAnnounce(a: Announce): Announce {
  return {
    ...a,
    bedrooms: a.bedrooms ?? a.bedroom,
    neighborhood: a.neighborhood ?? a.neighbourhood,
    postal_code: a.postal_code ?? a.zip,
  };
}

export const AnnouncesService = {
  list: (filters: AnnounceFilters = {}) =>
    client
      .get<PaginatedResponse<Announce>>('/announces', { params: filters })
      .then((r) => ({ ...r.data, data: r.data.data.map(normalizeAnnounce) })),

  show: (id: string) =>
    client.get<Announce>(`/announces/${id}`).then((r) => normalizeAnnounce(r.data)),

  // Same JSON body as the website: photos/videos are uploaded beforehand
  // (POST /uploads) and referenced through `media_ids`.
  create: (payload: Record<string, unknown>) =>
    client.post<Announce>('/announces', payload).then((r) => r.data),

  // PUT /announces/:id only reads a JSON body. New photos must be uploaded
  // first (POST /uploads) and referenced through `media_ids`.
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
    client.get<unknown>('/cities', { params }).then((r) => {
      console.log('[cities] raw response', JSON.stringify(r.data));
      // Response shape isn't documented in swagger — tolerate a plain string[],
      // an array of { city | name } objects, or a { data: [...] } envelope.
      const raw = r.data as unknown;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { data?: unknown[] })?.data)
        ? (raw as { data: unknown[] }).data
        : [];
      return list
        .map((entry) =>
          typeof entry === 'string'
            ? entry
            : ((entry as { city?: string; name?: string })?.city ??
                (entry as { city?: string; name?: string })?.name)
        )
        .filter((c): c is string => !!c);
    }),
};
