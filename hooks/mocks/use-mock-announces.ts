import { useEffect, useRef, useState } from 'react';
import type { Announce, AnnounceFilters } from '@/types/announce';
import { MOCK_ANNOUNCES } from '@/mocks/announces';

interface UseMockAnnouncesResult {
  data: Announce[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function applyFilters(announces: Announce[], filters: AnnounceFilters = {}): Announce[] {
  return announces.filter((ad) => {
    if (filters.type && ad.type !== filters.type) return false;
    if (filters.ad_type && ad.ad_type !== filters.ad_type) return false;
    if (filters.city && ad.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.standing && ad.standing !== filters.standing) return false;
    if (filters.budget_min && ad.price < filters.budget_min) return false;
    if (filters.budget_max && ad.price > filters.budget_max) return false;
    if (filters.bedroom_min && (ad.bedrooms ?? 0) < filters.bedroom_min) return false;
    if (filters.bedroom_max && (ad.bedrooms ?? 0) > filters.bedroom_max) return false;
    if (filters.AnnouncerId && ad.announcer_id !== filters.AnnouncerId) return false;
    if (filters.liked !== undefined && ad.liked !== filters.liked) return false;
    if (filters.category_id?.length) {
      if (!filters.category_id.includes(ad.category_id)) return false;
    }
    if (filters.amenities?.length) {
      const amenityMap: Record<string, keyof Announce> = {
        wifi: 'wifi',
        pool: 'pool',
        gate: 'gate',
        air_conditioning: 'air_conditioning',
        security_24h: 'security_24h',
        smart_tv: 'smart_tv',
        equipped_kitchen: 'equipped_kitchen',
      };
      const hasAll = filters.amenities.every((a) => {
        const key = amenityMap[a];
        return key ? Boolean(ad[key]) : true;
      });
      if (!hasAll) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${ad.description} ${ad.address} ${ad.city} ${ad.category?.name ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function useMockAnnounces(filters?: AnnounceFilters): UseMockAnnouncesResult {
  const [data, setData] = useState<Announce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const filtersKey = JSON.stringify(filters ?? {});
  const filtersKeyRef = useRef(filtersKey);
  filtersKeyRef.current = filtersKey;

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const parsed: AnnounceFilters = JSON.parse(filtersKeyRef.current);
      setData(applyFilters(MOCK_ANNOUNCES, parsed));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [filtersKey, tick]);

  const refetch = () => setTick((t) => t + 1);

  return { data, loading, error, refetch };
}
