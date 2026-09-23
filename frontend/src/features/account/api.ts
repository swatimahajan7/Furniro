import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import { useSession } from '@/api/session';
import type { OrderPage } from '@/api/types';

export const ORDERS_PAGE_SIZE = 10;

/** The logged-in user's orders, newest first (FR-AUTH-02). */
export function useMyOrders(page: number) {
  const userId = useSession((state) => state.user?.id ?? null);
  return useQuery({
    queryKey: queryKeys.orders.mine(userId, page),
    queryFn: ({ signal }) =>
      apiFetch<OrderPage>('/orders', { query: { page, page_size: ORDERS_PAGE_SIZE }, signal }),
    enabled: userId !== null,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
