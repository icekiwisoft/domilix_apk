import { useQuery } from '@tanstack/react-query';
import { CategoriesService } from '@/services/categories.service';
import type { CategoryType } from '@/types/announce';

export function useCategories(params?: { search?: string; type?: CategoryType; orderBy?: string; page?: number }) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => CategoriesService.list(params),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => CategoriesService.show(id),
    enabled: !!id,
  });
}
