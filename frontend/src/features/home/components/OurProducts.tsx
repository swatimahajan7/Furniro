import { ButtonLink, ErrorState } from '@/components/ui';
import { ProductGrid, useFeaturedProducts } from '@/features/catalog';

import styles from './OurProducts.module.css';

/** "Our Products": the 8 featured products, then "Show More" to the Shop (FR-HOME-01). */
export function OurProducts() {
  const products = useFeaturedProducts();

  return (
    <section className={`container ${styles.section}`} aria-labelledby="our-products-title">
      <h2 id="our-products-title" className={styles.title}>
        Our Products
      </h2>
      {products.isError ? (
        <ErrorState onRetry={() => void products.refetch()} data-testid="home-products-error" />
      ) : (
        <ProductGrid
          products={products.data?.items}
          isLoading={products.isPending}
          data-testid="home-products"
        />
      )}
      <div className={styles.more}>
        <ButtonLink
          to="/shop"
          variant="outline-primary"
          className={styles.moreButton}
          data-testid="home-show-more"
        >
          Show More
        </ButtonLink>
      </div>
    </section>
  );
}
