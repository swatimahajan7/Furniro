import { Hammer } from 'lucide-react';

import { ButtonLink, EmptyState } from '@/components/ui';

import styles from './ComingSoon.module.css';

export interface ComingSoonProps {
  /** Which delivery phase builds this screen (PLAN.md §7). */
  phase: number;
  what: string;
}

/** Temporary body for routes whose screen is built in a later phase. */
export function ComingSoon({ phase, what }: ComingSoonProps) {
  return (
    <div className={`container ${styles.wrap}`}>
      <EmptyState
        icon={Hammer}
        title={`${what} is on its way`}
        message={`This screen is built in Phase ${phase} of the plan.`}
        action={
          <ButtonLink to="/shop" variant="outline-primary" size="sm" data-testid="coming-soon-shop">
            Browse the shop
          </ButtonLink>
        }
        data-testid="coming-soon"
      />
    </div>
  );
}
