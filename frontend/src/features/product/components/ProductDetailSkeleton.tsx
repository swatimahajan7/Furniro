import { Skeleton } from '@/components/ui';

import styles from './ProductDetailView.module.css';

/** Placeholder layout while the product loads, shaped like the real page. */
export function ProductDetailSkeleton() {
  return (
    <section className={`container ${styles.top}`} aria-busy="true" data-testid="pdp-loading">
      <Skeleton height={500} rounded />
      <div className={styles.skeletonInfo}>
        <Skeleton width="60%" height={48} />
        <Skeleton width="30%" height={28} />
        <Skeleton width="45%" />
        <Skeleton height={80} />
        <Skeleton width="70%" height={64} rounded />
      </div>
    </section>
  );
}
