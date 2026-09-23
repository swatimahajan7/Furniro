import { useRef, useState } from 'react';

import type { ProductDetail } from '@/api/types';
import { Breadcrumb } from '@/components/layout';

import styles from './ProductDetailView.module.css';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductTabs, type ProductTabId } from './ProductTabs';
import { RelatedProducts } from './RelatedProducts';

/**
 * The whole product page for one product (DESIGN_SPEC §4.3). Render it with `key={slug}` so
 * the selected image, options, quantity and tab reset when the product changes.
 */
export function ProductDetailView({ product }: { product: ProductDetail }) {
  const [tab, setTab] = useState<ProductTabId>('description');
  const tabsRef = useRef<HTMLElement>(null);

  const showReviews = () => {
    setTab('reviews');
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Breadcrumb
        variant="bar"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: product.name },
        ]}
      />
      <section className={`container ${styles.top}`} data-testid="pdp-top">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductInfo product={product} onShowReviews={showReviews} />
      </section>
      <section ref={tabsRef} className={styles.tabs} aria-label="Product details">
        <div className="container">
          <ProductTabs product={product} value={tab} onChange={setTab} />
        </div>
      </section>
      <RelatedProducts slug={product.slug} />
    </>
  );
}
