import { CircleCheck } from 'lucide-react';

import type { Order } from '@/api/types';
import { ButtonLink } from '@/components/ui';
import { lineOptions } from '@/features/cart';
import { formatDate, formatPrice } from '@/lib/format';

import styles from './OrderDetails.module.css';

const PAYMENT_LABELS: Record<Order['payment_method'], string> = {
  bank_transfer: 'Direct Bank Transfer',
  cod: 'Cash On Delivery',
};

/** The order confirmation body (undesigned; built from existing tokens, PLAN.md §2.1). */
export function OrderDetails({ order }: { order: Order }) {
  const b = order.billing;
  return (
    <div className={styles.details} data-testid="order-details">
      <div className={styles.thanks}>
        <CircleCheck className={styles.icon} size={48} strokeWidth={1.5} aria-hidden="true" />
        <h2 className={styles.title}>Thank you, {b.first_name}! Your order is placed.</h2>
        <p className={styles.meta}>
          Order <strong data-testid="order-number">{order.order_number}</strong> · placed{' '}
          {formatDate(order.created_at)} · status{' '}
          <span data-testid="order-status">{order.status}</span>
        </p>
        {order.payment_method === 'bank_transfer' && (
          <p className={styles.note}>
            Please use <strong>{order.order_number}</strong> as the payment reference. We ship once
            the funds have cleared.
          </p>
        )}
      </div>

      <div className={styles.grid}>
        <section aria-labelledby="order-items-title">
          <h3 id="order-items-title" className={styles.heading}>
            Items
          </h3>
          <ul className={styles.items} data-testid="order-items">
            {order.items.map((item, index) => {
              const options = lineOptions(item);
              return (
                <li
                  key={`${item.product_slug}-${index}`}
                  className={styles.item}
                  data-testid={`order-item-${index + 1}`}
                >
                  <span>
                    {item.product_name}
                    {options && <span className={styles.options}> ({options})</span>} ×{' '}
                    {item.quantity}
                  </span>
                  <span>{formatPrice(item.line_total_minor)}</span>
                </li>
              );
            })}
          </ul>
          <dl className={styles.totals}>
            <dt>Subtotal</dt>
            <dd data-testid="order-subtotal">{formatPrice(order.subtotal_minor)}</dd>
            <dt>Shipping</dt>
            <dd>Free</dd>
            <dt>Total</dt>
            <dd className={styles.total} data-testid="order-total">
              {formatPrice(order.total_minor)}
            </dd>
          </dl>
        </section>

        <section aria-labelledby="order-billing-title">
          <h3 id="order-billing-title" className={styles.heading}>
            Billing
          </h3>
          <address className={styles.address} data-testid="order-billing">
            {b.first_name} {b.last_name}
            {b.company && <br />}
            {b.company}
            <br />
            {b.street}
            <br />
            {b.city}, {b.province} {b.zip}
            <br />
            {b.country}
            <br />
            {b.phone} · {b.email}
          </address>
          <h3 className={styles.heading}>Payment</h3>
          <p data-testid="order-payment-method">{PAYMENT_LABELS[order.payment_method]}</p>
        </section>
      </div>

      <ButtonLink
        to="/shop"
        variant="outline-primary"
        className={styles.cta}
        data-testid="order-continue-shopping"
      >
        Continue shopping
      </ButtonLink>
    </div>
  );
}
