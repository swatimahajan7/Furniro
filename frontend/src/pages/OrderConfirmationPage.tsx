import { useState } from 'react';
import { useLocation, useParams } from 'react-router';

import { ApiError } from '@/api/client';
import type { Order } from '@/api/types';
import { PageLoader, PageShell } from '@/components/layout';
import { ErrorState } from '@/components/ui';
import { useIsLoggedIn } from '@/features/auth';
import { OrderDetails, OrderLookupForm, recallOrderEmail, useOrder } from '@/features/checkout';

import styles from './OrderConfirmationPage.module.css';

export default function OrderConfirmationPage() {
  const { orderNumber = '' } = useParams();
  const location = useLocation();
  // Trust boundary: checkout navigates here with { state: { order } } (CheckoutForm).
  const handedOver = (location.state as { order?: Order } | null)?.order;
  const fromCheckout = handedOver?.order_number === orderNumber ? handedOver : undefined;

  const [email, setEmail] = useState(() => recallOrderEmail(orderNumber));
  // The owner needs no email; the lookup form appears if the order is not theirs.
  const isLoggedIn = useIsLoggedIn();
  const lookup = useOrder(orderNumber, fromCheckout ? null : email);
  const order = fromCheckout ?? lookup.data;
  const notFound = lookup.error instanceof ApiError && lookup.error.status === 404;

  let content;
  if (order) {
    content = <OrderDetails order={order} />;
  } else if ((!email && !isLoggedIn) || notFound) {
    content = (
      <OrderLookupForm
        orderNumber={orderNumber}
        onLookup={setEmail}
        isLoading={lookup.isFetching}
        notFound={notFound}
      />
    );
  } else if (lookup.isError) {
    content = <ErrorState onRetry={() => void lookup.refetch()} data-testid="order-error" />;
  } else {
    content = <PageLoader />;
  }

  return (
    <PageShell
      title="Order Confirmation"
      name="order-confirmation"
      crumbs={[{ label: 'Home', to: '/' }, { label: `Order ${orderNumber}` }]}
    >
      <div className={`container ${styles.page}`}>{content}</div>
    </PageShell>
  );
}
