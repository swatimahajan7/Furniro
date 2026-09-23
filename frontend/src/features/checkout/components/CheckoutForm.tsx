import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { FormProvider, useForm, type Path } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { ApiError } from '@/api/client';
import type { Cart } from '@/api/types';
import { markCartEmpty } from '@/features/cart';
import { errorMessage } from '@/lib/errors';

import { usePlaceOrder } from '../api';
import { CHECKOUT_DEFAULTS, checkoutSchema, type CheckoutValues } from '../schema';

import { BillingFields } from './BillingFields';
import styles from './CheckoutForm.module.css';
import { OrderSummaryPanel } from './OrderSummaryPanel';

const FIELDS = new Set(Object.keys(CHECKOUT_DEFAULTS));

/** "billing.email" → "email"; anything that is not a form field returns null. */
function formField(apiField: string | null | undefined): Path<CheckoutValues> | null {
  const name = (apiField ?? '').replace(/^billing\./, '');
  return FIELDS.has(name) ? (name as Path<CheckoutValues>) : null;
}

export interface CheckoutFormProps {
  cart: Cart;
  /** Called just before navigating away, so the page can stop its empty-cart redirect. */
  onPlaced: () => void;
}

/** Billing form + order summary. Validates on submit, then on change (GUIDELINES §7). */
export function CheckoutForm({ cart, onPlaced }: CheckoutFormProps) {
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: CHECKOUT_DEFAULTS,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const placeOrder = usePlaceOrder();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string>();

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(undefined);
    try {
      const order = await placeOrder.mutateAsync(values);
      onPlaced();
      void navigate(`/order/${order.order_number}`, { state: { order } });
      markCartEmpty(queryClient);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        let focused = false;
        for (const detail of error.details) {
          const name = formField(detail.field);
          if (!name) continue;
          form.setError(name, { message: detail.message }, { shouldFocus: !focused });
          focused = true;
        }
        if (!focused) setFormError(error.message);
        return;
      }
      if (
        error instanceof ApiError &&
        (error.code === 'INSUFFICIENT_STOCK' || error.code === 'CART_EMPTY')
      ) {
        // The cart changed under us; show the problem and refresh the summary.
        void queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
      setFormError(errorMessage(error));
    }
  });

  return (
    <FormProvider {...form}>
      <form
        className={styles.form}
        onSubmit={(event) => void onSubmit(event)}
        noValidate
        data-testid="checkout-form"
      >
        <BillingFields />
        <OrderSummaryPanel
          cart={cart}
          isSubmitting={form.formState.isSubmitting || placeOrder.isPending}
          formError={formError}
        />
      </form>
    </FormProvider>
  );
}
