import { useState, type FormEvent } from 'react';

import { Button, Input } from '@/components/ui';

import styles from './OrderLookupForm.module.css';

export interface OrderLookupFormProps {
  orderNumber: string;
  onLookup: (email: string) => void;
  isLoading: boolean;
  /** Shown when the last lookup found nothing. */
  notFound: boolean;
}

/** Asks for the checkout email when this tab does not remember it (new tab, shared link). */
export function OrderLookupForm({
  orderNumber,
  onLookup,
  isLoading,
  notFound,
}: OrderLookupFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    setError(undefined);
    onLookup(email.trim());
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      data-testid="order-lookup-form"
    >
      <h2 className={styles.title}>Find order {orderNumber}</h2>
      <p className={styles.text}>Enter the email address you used at checkout to see this order.</p>
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={
          error ?? (notFound ? 'We could not find this order with that email address.' : undefined)
        }
        data-testid="order-lookup-field-email"
      />
      <Button type="submit" isLoading={isLoading} data-testid="order-lookup-submit">
        Find my order
      </Button>
    </form>
  );
}
