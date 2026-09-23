import { useId, type Ref, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

import { describedBy } from './fieldIds';
import { FieldFrame, type FieldProps } from './FieldFrame';
import styles from './fields.module.css';

export interface TextareaProps
  extends
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>,
    Omit<FieldProps, 'variant'> {
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  hideLabel,
  hint,
  error,
  className,
  'data-testid': testId,
  errorTestId,
  id: idProp,
  rows = 4,
  ...rest
}: TextareaProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldFrame
      {...{ id, label, hideLabel, hint, error, className, errorTestId }}
      data-testid={testId}
    >
      <textarea
        id={id}
        rows={rows}
        className={cn(styles.control, styles.box, styles.textarea, error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        data-testid={testId}
        {...rest}
      />
    </FieldFrame>
  );
}
