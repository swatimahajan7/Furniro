import { Star } from 'lucide-react';
import { useId, type Ref } from 'react';

import { cn } from '@/lib/cn';

import styles from './ReviewForm.module.css';

export interface StarInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  /** Put on the first star so the form can focus the field when it is invalid. */
  inputRef?: Ref<HTMLInputElement>;
  'data-testid': string;
}

/** Five radio buttons drawn as stars; arrow keys move between them like any radio group. */
export function StarInput({
  value,
  onChange,
  error,
  inputRef,
  'data-testid': testId,
}: StarInputProps) {
  const name = useId();
  const errorId = `${name}-error`;
  return (
    <fieldset
      className={styles.stars}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      data-testid={testId}
      data-value={value}
    >
      <legend className={styles.legend}>Your rating</legend>
      <div className={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className={cn(styles.star, star <= value && styles.starOn)}>
            <input
              ref={star === 1 ? inputRef : undefined}
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="visuallyHidden"
              data-testid={`${testId}-${star}`}
            />
            <Star size={28} aria-hidden="true" />
            <span className="visuallyHidden">
              {star} star{star === 1 ? '' : 's'}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error} data-testid={testId.replace('-field-', '-error-')}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
