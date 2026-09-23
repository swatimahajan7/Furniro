import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import styles from './fields.module.css';

/**
 * Form controls with a label above, optional hint and error text below (DESIGN_SPEC §3 "Form
 * fields"). `data-testid` goes on the native control; the error text gets `errorTestId`, which
 * defaults to the control's ID with "-field-" replaced by "-error-" (GUIDELINES §6.2).
 */
export interface FieldProps {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  /** "box" = 75 px bordered input (forms) · "underline" = footer newsletter style */
  variant?: 'box' | 'underline';
  className?: string;
  'data-testid'?: string;
  errorTestId?: string;
}

function errorIdFor(testId?: string, explicit?: string) {
  if (explicit) return explicit;
  if (!testId) return undefined;
  return testId.includes('-field-') ? testId.replace('-field-', '-error-') : `${testId}-error`;
}

export interface FieldFrameProps extends FieldProps {
  id: string;
  children: ReactNode;
}

export function FieldFrame({
  id,
  label,
  hideLabel,
  hint,
  error,
  className,
  'data-testid': testId,
  errorTestId,
  children,
}: FieldFrameProps) {
  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={id} className={cn(styles.label, hideLabel && 'visuallyHidden')}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className={styles.error}
          role="alert"
          data-testid={errorIdFor(testId, errorTestId)}
        >
          {error}
        </p>
      )}
    </div>
  );
}
