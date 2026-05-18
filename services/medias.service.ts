import { client } from './api.client';
import type { Media } from '@/types/announce';

export const MediasService = {
  list: (params?: { AnnounceId?: string; AnnouncerId?: string; page?: string }) =>
    client.get<Media[]>('/medias', { params }).then((r) => r.data),

  show: (id: string) =>
    client.get<Media>(`/medias/${id}`).then((r) => r.data),

  upload: (formData: FormData) =>
    client
      .post<Media[]>('/medias', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  destroy: (id: string, AdId?: string) =>
    client.delete(`/medias/${id}`, { params: { AdId } }).then((r) => r.data),
};
