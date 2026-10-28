import { client } from './api.client';
import type { AnnouncerVerificationRequest } from '@/types/verification';

export const AnnouncerRequestsService = {
  me: () =>
    client
      .get<AnnouncerVerificationRequest | null>('/announcer-requests/me')
      .then((r) => r.data ?? null),

  create: (dto: { identity_document_media_id: string; contact_phone?: string }) =>
    client
      .post<{ message: string }>('/announcer-requests', dto)
      .then((r) => r.data),
};
