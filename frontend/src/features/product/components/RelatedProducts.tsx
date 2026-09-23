import { Button } from '@/components/ui';
import { ProductGrid } from '@/features/catalog';

import { RELATED_PAGE_SIZE, useRelatedProducts } from '../api';

import styles from './RelatedProducts.module.css';

/** Same-category products, 4 at a time, with "Show More" (FR-PDP-06). Hidden when there are none. */
export function RelatedProducts({ slug }: { slug: string }) {
  const related = useRelatedProducts(slug);
  const items = related.data?.pages.flatMap((page) => page.items);

  if (related.isError || (items && items.length === 0)) return null;

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="related-title"
      data-testid="pdp-related"
    >
      <h2 id="related-title" className={styles.title}>
        Related Products
      </h2>
      <ProductGrid
        products={items}
        isLoading={related.isPending}
        skeletonCount={RELATED_PAGE_SIZE}
        data-testid="pdp-related-products"
      />
      {related.hasNextPage && (
        <div className={styles.more}>
          <Button
            variant="outline-primary"
            className={styles.moreButton}
            onClick={() => void related.fetchNextPage()}
            isLoading={related.isFetchingNextPage}
            data-testid="pdp-related-show-more"
          >
            Show More
          </Button>
        </div>
      )}
    </section>
  );
}
