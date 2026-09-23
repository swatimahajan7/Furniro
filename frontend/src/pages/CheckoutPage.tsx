import { useState } from 'react';
import { Navigate } from 'react-router';

import { PageLoader, PageShell } from '@/components/layout';
import { ErrorState } from '@/components/ui';
import { useCart } from '@/features/cart';
import { CheckoutForm } from '@/features/checkout';

import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const cart = useCart();
  // After "Place order" the cart empties before navigation finishes; don't bounce to /cart.
  const [placed, setPlaced] = useState(false);

  let content;
  if (cart.isPending) {
    content = <PageLoader />;
  } else if (cart.isError) {
    content = <ErrorState onRetry={() => void cart.refetch()} data-testid="checkout-error" />;
  } else if (!cart.data || (cart.data.items.length === 0 && !placed)) {
    // Nothing to buy (FR-CHK-06).
    return <Navigate to="/cart" replace />;
  } else {
    content = <CheckoutForm cart={cart.data} onPlaced={() => setPlaced(true)} />;
  }

  return (
    <PageShell title="Checkout" featureStrip>
      <div className={`container ${styles.page}`}>{content}</div>
    </PageShell>
  );
}
