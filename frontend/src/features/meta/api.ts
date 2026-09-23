import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { Country, MetaConfig } from '@/api/types';

/** Store configuration (currency, page sizes, compare limit). Changes only on deploy. */
export function useMetaConfig() {
  return useQuery({
    queryKey: queryKeys.meta.config,
    queryFn: ({ signal }) => apiFetch<MetaConfig>('/meta/config', { signal }),
    staleTime: Infinity,
  });
}

/** Countries and provinces for the checkout form. */
export function useLocations() {
  return useQuery({
    queryKey: queryKeys.meta.locations,
    queryFn: ({ signal }) => apiFetch<Country[]>('/meta/locations', { signal }),
    staleTime: Infinity,
  });
}
