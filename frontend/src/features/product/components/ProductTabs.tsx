import type { ProductDetail } from '@/api/types';
import { Tabs } from '@/components/ui';

import styles from './ProductTabs.module.css';
import { ReviewList } from './ReviewList';
import { SpecTable } from './SpecTable';
import { mediaSrcSet } from '@/lib/images';

export type ProductTabId = 'description' | 'info' | 'reviews';

export interface ProductTabsProps {
  product: ProductDetail;
  value: ProductTabId;
  onChange: (tab: ProductTabId) => void;
}

/** Description / Additional Information / Reviews [N] (FR-PDP-04). */
export function ProductTabs({ product, value, onChange }: ProductTabsProps) {
  const descriptionImages = product.images.filter((image) => image.kind === 'description');

  return (
    <Tabs
      value={value}
      onChange={(id) => onChange(id as ProductTabId)}
      data-testid="pdp-tabs"
      items={[
        {
          id: 'description',
          label: 'Description',
          content: (
            <div className={styles.description}>
              {product.description.map((paragraph) => (
                <p key={paragraph} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
              {descriptionImages.length > 0 && (
                <div className={styles.images}>
                  {descriptionImages.map((image) => (
                    <div key={image.url} className={styles.imageBox}>
                      <img
                        src={image.url}
                        srcSet={mediaSrcSet(image.url)}
                        sizes="(min-width: 1024px) 605px, 100vw"
                        alt={image.alt}
                        loading="lazy"
                        className={styles.image}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
        },
        {
          id: 'info',
          label: 'Additional Information',
          content: <SpecTable specs={product.specs} />,
        },
        {
          id: 'reviews',
          label: `Reviews [${product.review_count}]`,
          content: <ReviewList slug={product.slug} active={value === 'reviews'} />,
        },
      ]}
    />
  );
}
