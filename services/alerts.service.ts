import { client } from './api.client';
import type { AlertFilters, SearchAlert } from '@/types/alert';
import type { PaginatedResponse } from '@/types/announce';

export const AlertsService = {
  list: (params: { page?: number; per_page?: number; status?: 'active' | 'inactive' } = {}) =>
    client
      .get<PaginatedResponse<SearchAlert>>('/alerts', { params })
      .then((r) => r.data),

  create: (dto: {
    requestType: 'realestate' | 'furniture';
    description?: string;
    filters: AlertFilters;
  }) => client.post<SearchAlert>('/alerts', dto).then((r) => r.data),

  updateStatus: (id: number, status: 'active' | 'inactive') =>
    client.patch<SearchAlert>(`/alerts/${id}/status`, { status }).then((r) => r.data),

  destroy: (id: number) => client.delete(`/alerts/${id}`).then((r) => r.data),
};
