import type { Cart } from '@/api/types';
import { ButtonLink } from '@/components/ui';
import { formatPrice } from '@/lib/format';

import styles from './CartTotals.module.css';

/** The cream "Cart Totals" box beside the cart table (DESIGN_SPEC §4.6). */
export function CartTotals({ cart }: { cart: Cart }) {
  return (
    <section className={styles.box} aria-labelledby="cart-totals-title" data-testid="cart-totals">
      <h2 id="cart-totals-title" className={styles.title}>
        Cart Totals
      </h2>
      <dl className={styles.rows}>
        <dt>Subtotal</dt>
        <dd className={styles.subtotal} data-testid="cart-totals-subtotal">
          {formatPrice(cart.subtotal_minor)}
        </dd>
        <dt>Total</dt>
        <dd className={styles.total} data-testid="cart-totals-total">
          {formatPrice(cart.total_minor)}
        </dd>
      </dl>
      <ButtonLink
        to="/checkout"
        variant="outline-dark"
        className={styles.checkout}
        data-testid="cart-checkout-button"
      >
        Check Out
      </ButtonLink>
    </section>
  );
}
