import { useId, type InputHTMLAttributes, type Ref } from 'react';

import { cn } from '@/lib/cn';

import { describedBy } from './fieldIds';
import { FieldFrame, type FieldProps } from './FieldFrame';
import styles from './fields.module.css';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>, FieldProps {
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  label,
  hideLabel,
  hint,
  error,
  variant = 'box',
  className,
  'data-testid': testId,
  errorTestId,
  id: idProp,
  ...rest
}: InputProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldFrame
      {...{ id, label, hideLabel, hint, error, className, errorTestId }}
      data-testid={testId}
    >
      <input
        id={id}
        className={cn(styles.control, styles[variant], error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        data-testid={testId}
        {...rest}
      />
    </FieldFrame>
  );
}
