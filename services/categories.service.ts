import { client } from './api.client';
import type { Category, CategoryType, PaginatedResponse } from '@/types/announce';

export const CategoriesService = {
  list: (params?: { search?: string; type?: CategoryType; orderBy?: string; page?: number }) =>
    client
      .get<PaginatedResponse<Category>>('/categories', { params })
      .then((r) => r.data),

  show: (id: string) =>
    client.get<Category>(`/categories/${id}`).then((r) => r.data),
};
