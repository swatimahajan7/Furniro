import { ChevronDown } from 'lucide-react';
import { useId, type Ref, type SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

import { describedBy } from './fieldIds';
import { FieldFrame, type FieldProps } from './FieldFrame';
import styles from './fields.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'>, Omit<FieldProps, 'variant'> {
  options: SelectOption[];
  placeholder?: string;
  /** "box" = form select · "compact" = small toolbar select (Shop "Show" / "Sort by") */
  variant?: 'box' | 'compact';
  ref?: Ref<HTMLSelectElement>;
}

export function Select({
  label,
  hideLabel,
  hint,
  error,
  className,
  'data-testid': testId,
  errorTestId,
  id: idProp,
  options,
  placeholder,
  variant = 'box',
  ...rest
}: SelectProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldFrame
      {...{ id, label, hideLabel, hint, error, className, errorTestId }}
      data-testid={testId}
    >
      <span className={styles.selectWrap}>
        <select
          id={id}
          className={cn(styles.control, styles[variant], styles.select, error && styles.invalid)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          data-testid={testId}
          {...rest}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
      </span>
    </FieldFrame>
  );
}
