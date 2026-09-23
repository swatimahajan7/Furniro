import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import { useSession } from '@/api/session';
import type { Order } from '@/api/types';

import { rememberOrderEmail } from './recentOrders';
import type { CheckoutValues } from './schema';

/** Places the order from the current cart (the API client adds X-Cart-Id). */
export function usePlaceOrder() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ payment_method, ...billing }: CheckoutValues) =>
      apiFetch<Order>('/orders', {
        method: 'POST',
        body: {
          billing: {
            ...billing,
            company: billing.company || null,
            notes: billing.notes || null,
          },
          payment_method,
        },
      }),
    onSuccess: (order) => {
      rememberOrderEmail(order.order_number, order.billing.email);
      // A logged-in customer's order list now has a new entry.
      void client.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

/**
 * Looks up an order (GET /orders/{n}). A logged-in owner needs nothing else; anyone else
 * passes the email used at checkout.
 */
export function useOrder(orderNumber: string, email: string | null) {
  const userId = useSession((state) => state.user?.id ?? null);
  return useQuery({
    queryKey: queryKeys.orders.detail(orderNumber, email ?? '', userId),
    queryFn: ({ signal }) =>
      apiFetch<Order>(`/orders/${encodeURIComponent(orderNumber)}`, { query: { email }, signal }),
    enabled: Boolean(orderNumber && (email || userId !== null)),
    staleTime: Infinity,
    retry: false,
  });
}
