import { client } from './api.client';
import type { Announce, AnnounceFilters, PaginatedResponse } from '@/types/announce';

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

  update: (id: string, formData: FormData) =>
    client
      .put<Announce>(`/announces/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

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
  }) => client.get<string[]>('/cities', { params }).then((r) => r.data),
};
