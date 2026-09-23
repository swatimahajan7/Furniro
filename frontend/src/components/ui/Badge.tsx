import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import styles from './Badge.module.css';

export interface BadgeProps {
  /** sale: red "-30%" circle · new: teal "New" circle */
  variant: 'sale' | 'new';
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function Badge({ variant, children, className, 'data-testid': testId }: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, styles[variant], className)}
      data-testid={testId}
      data-variant={variant}
    >
      {children}
    </span>
  );
}
