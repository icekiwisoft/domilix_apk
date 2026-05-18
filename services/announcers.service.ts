import { client } from './api.client';
import type { Announcer } from '@/types/announcer';
import type { PaginatedResponse } from '@/types/announce';

export const AnnouncersService = {
  list: (page?: number) =>
    client
      .get<PaginatedResponse<Announcer>>('/announcers', { params: { page } })
      .then((r) => r.data),

  show: (id: string) =>
    client.get<Announcer>(`/announcers/${id}`).then((r) => r.data),

  update: (id: string, formData: FormData) =>
    client
      .put<Announcer>(`/announcers/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  destroy: (id: string) =>
    client.delete(`/announcers/${id}`).then((r) => r.data),

  medias: (announcerId: string, page?: string) =>
    client
      .get(`/announcers/${announcerId}/medias`, { params: { page } })
      .then((r) => r.data),
};
