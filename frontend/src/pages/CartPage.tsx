import { ShoppingBag } from 'lucide-react';

import { PageShell } from '@/components/layout';
import { ButtonLink, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { CartTable, CartTotals, useCart } from '@/features/cart';

import styles from './CartPage.module.css';

export default function CartPage() {
  const cart = useCart();

  let content;
  if (cart.isPending) {
    content = (
      <div className={styles.layout} aria-busy="true" data-testid="cart-loading">
        <Skeleton height={260} rounded />
        <Skeleton height={390} rounded />
      </div>
    );
  } else if (cart.isError) {
    content = <ErrorState onRetry={() => void cart.refetch()} data-testid="cart-error" />;
  } else if (!cart.data || cart.data.items.length === 0) {
    content = (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        message="Browse the shop and add the pieces you love."
        action={
          <ButtonLink to="/shop" variant="primary" data-testid="cart-continue-shopping">
            Continue shopping
          </ButtonLink>
        }
        data-testid="cart-empty"
      />
    );
  } else {
    content = (
      <div className={styles.layout}>
        <CartTable cart={cart.data} />
        <CartTotals cart={cart.data} />
      </div>
    );
  }

  return (
    <PageShell title="Cart" featureStrip>
      <div className={`container ${styles.page}`}>{content}</div>
    </PageShell>
  );
}
