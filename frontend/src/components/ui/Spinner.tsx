import { cn } from '@/lib/cn';

import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** Screen-reader text. Omit when the spinner sits inside a control that already says "loading". */
  label?: string;
  className?: string;
  'data-testid'?: string;
}

export function Spinner({ size = 'md', label, className, 'data-testid': testId }: SpinnerProps) {
  return (
    <span
      className={cn(styles.spinner, styles[size], className)}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      data-testid={testId}
    >
      {label && <span className="visuallyHidden">{label}</span>}
    </span>
  );
}
