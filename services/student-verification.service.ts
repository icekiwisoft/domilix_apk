import { client } from './api.client';
import type { StudentVerificationRequest } from '@/types/verification';

export const StudentVerificationService = {
  me: () =>
    client
      .get<StudentVerificationRequest | null>('/student-verification/me')
      .then((r) => r.data ?? null),

  create: (dto: { student_id_media_id: string; receipt_media_id: string }) =>
    client
      .post<{ message: string }>('/student-verification', dto)
      .then((r) => r.data),
};
