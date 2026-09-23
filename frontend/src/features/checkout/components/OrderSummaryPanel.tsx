import { Controller, useFormContext } from 'react-hook-form';
import { Link } from 'react-router';

import type { Cart } from '@/api/types';
import { Button, RadioGroup } from '@/components/ui';
import { lineOptions } from '@/features/cart';
import { formatPrice } from '@/lib/format';

import type { CheckoutValues } from '../schema';

import styles from './OrderSummaryPanel.module.css';

const PAYMENT_OPTIONS = [
  {
    value: 'bank_transfer',
    label: 'Direct Bank Transfer',
    description:
      'Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.',
  },
  {
    value: 'cod',
    label: 'Cash On Delivery',
    description: 'Pay in cash when your furniture is delivered.',
  },
];

export interface OrderSummaryPanelProps {
  cart: Cart;
  isSubmitting: boolean;
  /** Problems that are not tied to one field (e.g. stock ran out). */
  formError?: string;
}

/** The right column of checkout: items, totals, payment method, Place order (DESIGN_SPEC §4.7). */
export function OrderSummaryPanel({ cart, isSubmitting, formError }: OrderSummaryPanelProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<CheckoutValues>();

  return (
    <aside className={styles.panel} aria-labelledby="summary-title" data-testid="checkout-summary">
      <div className={styles.head}>
        <h2 id="summary-title">Product</h2>
        <span aria-hidden="true">Subtotal</span>
      </div>
      <ul className={styles.items}>
        {cart.items.map((item) => {
          const options = lineOptions(item);
          return (
            <li
              key={item.id}
              className={styles.item}
              data-testid={`checkout-summary-item-${item.id}`}
            >
              <span className={styles.itemName}>
                {item.product.name}
                {options && <span className={styles.options}> ({options})</span>}
                <span className={styles.qty}> × {item.quantity}</span>
              </span>
              <span>{formatPrice(item.line_total_minor)}</span>
            </li>
          );
        })}
      </ul>
      <dl className={styles.totals}>
        <dt>Subtotal</dt>
        <dd data-testid="checkout-summary-subtotal">{formatPrice(cart.subtotal_minor)}</dd>
        <dt>Total</dt>
        <dd className={styles.total} data-testid="checkout-summary-total">
          {formatPrice(cart.total_minor)}
        </dd>
      </dl>

      <Controller
        control={control}
        name="payment_method"
        render={({ field }) => (
          <RadioGroup
            legend="Payment method"
            hideLegend
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            options={PAYMENT_OPTIONS}
            showDescription="selected"
            error={errors.payment_method?.message}
            className={styles.payment}
            data-testid="checkout-payment"
          />
        )}
      />

      <p className={styles.privacy}>
        Your personal data will be used to support your experience throughout this website, to
        manage access to your account, and for other purposes described in our{' '}
        <Link
          to="/help/privacy-policy"
          className={styles.privacyLink}
          data-testid="checkout-privacy-link"
        >
          privacy policy
        </Link>
        .
      </p>

      {formError && (
        <p className={styles.formError} role="alert" data-testid="checkout-form-error">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        variant="outline-dark"
        className={styles.place}
        isLoading={isSubmitting}
        data-testid="checkout-place-order"
      >
        Place order
      </Button>
    </aside>
  );
}
