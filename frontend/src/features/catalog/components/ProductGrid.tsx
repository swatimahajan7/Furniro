import type { ProductSummary } from '@/api/types';
import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';

import { ProductCard } from './ProductCard';
import styles from './ProductGrid.module.css';

const viewClass = { grid: styles.gridView, list: styles.listView } as const;

export interface ProductGridProps {
  products: ProductSummary[] | undefined;
  isLoading?: boolean;
  /** How many skeleton cards to show while loading. */
  skeletonCount?: number;
  view?: 'grid' | 'list';
  /** Dims the grid while a new page loads over the previous one. */
  isRefreshing?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  view = 'grid',
  isRefreshing = false,
  className,
  'data-testid': testId = 'product-grid',
}: ProductGridProps) {
  if (isLoading || !products) {
    return (
      <div
        className={cn(styles.collection, viewClass[view], className)}
        aria-busy="true"
        data-testid={`${testId}-loading`}
      >
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div key={i} className={styles.skeleton}>
            <Skeleton height={view === 'list' ? 220 : 301} />
            <Skeleton width="60%" height={24} />
            <Skeleton width="80%" />
            <Skeleton width="40%" height={20} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul
      className={cn(
        styles.collection,
        viewClass[view],
        isRefreshing && styles.refreshing,
        className,
      )}
      aria-busy={isRefreshing || undefined}
      data-testid={testId}
      data-count={products.length}
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} variant={view} />
        </li>
      ))}
    </ul>
  );
}
