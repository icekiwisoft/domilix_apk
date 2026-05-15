import { useEffect, useState } from 'react';
import type { Category, CategoryType } from '@/types/announce';
import { MOCK_CATEGORIES } from '@/mocks/categories';

interface UseMockCategoriesResult {
  data: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMockCategories(type?: CategoryType): UseMockCategoriesResult {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const result = type
        ? MOCK_CATEGORIES.filter((c) => c.type === type)
        : MOCK_CATEGORIES;
      setData(result);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [type, tick]);

  const refetch = () => setTick((t) => t + 1);

  return { data, loading, error, refetch };
}
