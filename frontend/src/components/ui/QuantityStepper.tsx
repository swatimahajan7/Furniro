import { Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/cn';

import styles from './QuantityStepper.module.css';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  /** Accessible name, e.g. "Quantity of Asgaard sofa". */
  label?: string;
  size?: 'md' | 'sm';
  className?: string;
  /** Base ID: renders `${base}-decrement`, `${base}-value`, `${base}-increment`. */
  'data-testid'?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
  label = 'Quantity',
  size = 'md',
  className,
  'data-testid': testId,
}: QuantityStepperProps) {
  const part = (name: string) => (testId ? `${testId}-${name}` : undefined);
  return (
    <div
      className={cn(styles.stepper, styles[size], className)}
      role="group"
      aria-label={label}
      data-testid={testId}
    >
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        data-testid={part('decrement')}
      >
        <Minus size={16} />
      </button>
      <output className={styles.value} aria-live="polite" data-testid={part('value')}>
        {value}
      </output>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        data-testid={part('increment')}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
