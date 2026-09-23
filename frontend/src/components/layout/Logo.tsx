import { Link } from 'react-router';

import { cn } from '@/lib/cn';

import styles from './Logo.module.css';

export interface LogoProps {
  className?: string;
  'data-testid'?: string;
}

export function Logo({ className, 'data-testid': testId = 'header-logo' }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn(styles.logo, className)}
      aria-label="Furniro home"
      data-testid={testId}
    >
      <img src="/logo-mark.svg" alt="" width={50} height={32} className={styles.mark} />
      <span className={styles.wordmark}>Furniro</span>
    </Link>
  );
}
