import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router';

import type { OrderSummary } from '@/api/types';
import { ButtonLink, EmptyState, ErrorState, Pagination, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDate, formatPrice } from '@/lib/format';
import { testIds } from '@/lib/testIds';

import { useMyOrders } from '../api';

import styles from './Account.module.css';

const PAYMENT_LABELS: Record<OrderSummary['payment_method'], string> = {
  bank_transfer: 'Direct Bank Transfer',
  cod: 'Cash On Delivery',
};

export interface OrderHistoryProps {
  page: number;
  hrefFor: (page: number) => string;
}

/** "My orders": number, date, items, total and status, each linking to the order page. */
export function OrderHistory({ page, hrefFor }: OrderHistoryProps) {
  const orders = useMyOrders(page);

  if (orders.isPending) {
    return (
      <div className={styles.orders} aria-busy="true" data-testid="account-orders-loading">
        {[1, 2].map((n) => (
          <Skeleton key={n} height={72} rounded />
        ))}
      </div>
    );
  }
  if (orders.isError) {
    return <ErrorState onRetry={() => void orders.refetch()} data-testid="account-orders-error" />;
  }
  if (orders.data.total === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No orders yet"
        message="When you place an order it will show up here."
        action={
          <ButtonLink to="/shop" variant="outline-primary" data-testid="account-start-shopping">
            Start shopping
          </ButtonLink>
        }
        data-testid="account-orders-empty"
      />
    );
  }

  return (
    <div className={cn(styles.orders, orders.isPlaceholderData && styles.refreshing)}>
      <ul className={styles.orderList} data-testid="account-orders" data-count={orders.data.total}>
        {orders.data.items.map((order) => {
          const ids = testIds.accountOrder(order.order_number);
          return (
            <li key={order.order_number} className={styles.order} data-testid={ids.root}>
              <div>
                <Link
                  to={`/order/${order.order_number}`}
                  className={styles.orderLink}
                  data-testid={ids.link}
                >
                  {order.order_number}
                </Link>
                <p className={styles.muted}>
                  <time dateTime={order.created_at}>{formatDate(order.created_at)}</time> ·{' '}
                  {order.item_count} item{order.item_count === 1 ? '' : 's'} ·{' '}
                  {PAYMENT_LABELS[order.payment_method]}
                </p>
              </div>
              <span className={styles.status} data-testid={ids.status}>
                {order.status}
              </span>
              <span className={styles.total} data-testid={ids.total}>
                {formatPrice(order.total_minor)}
              </span>
            </li>
          );
        })}
      </ul>
      <Pagination
        page={page}
        totalPages={orders.data.total_pages}
        hrefFor={hrefFor}
        data-testid="account-orders-pagination"
      />
    </div>
  );
}
