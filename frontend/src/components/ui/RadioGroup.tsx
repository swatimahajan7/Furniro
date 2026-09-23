import { useId } from 'react';

import { cn } from '@/lib/cn';

import styles from './fields.module.css';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  legend: string;
  hideLegend?: boolean;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  /** "selected" shows a description only under the chosen option (checkout payment methods). */
  showDescription?: 'always' | 'selected';
  error?: string;
  className?: string;
  /** Base ID: each option gets `${base}-${value}`, the error text `${base}-error`. */
  'data-testid'?: string;
}

export function RadioGroup({
  legend,
  hideLegend,
  name,
  options,
  value,
  onChange,
  showDescription = 'always',
  error,
  className,
  'data-testid': testId,
}: RadioGroupProps) {
  const baseId = useId();
  return (
    <fieldset
      className={cn(styles.radioGroup, className)}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${baseId}-error` : undefined}
      data-testid={testId}
    >
      <legend className={cn(styles.label, hideLegend && 'visuallyHidden')}>{legend}</legend>
      {options.map((option) => {
        const optionId = `${baseId}-${option.value}`;
        const checked = option.value === value;
        const showText = option.description && (showDescription === 'always' || checked);
        return (
          <div key={option.value} className={styles.radio}>
            <input
              id={optionId}
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className={styles.radioInput}
              data-testid={testId ? `${testId}-${option.value}` : undefined}
            />
            <label htmlFor={optionId} className={cn(styles.radioLabel, checked && styles.checked)}>
              {option.label}
            </label>
            {showText && <p className={styles.radioDescription}>{option.description}</p>}
          </div>
        );
      })}
      {error && (
        <p
          id={`${baseId}-error`}
          className={styles.error}
          role="alert"
          data-testid={testId ? `${testId}-error` : undefined}
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
