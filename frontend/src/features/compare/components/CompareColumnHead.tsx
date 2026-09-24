import { ImageOff, X } from 'lucide-react';
import { Link } from 'react-router';

import type { ProductSummary } from '@/api/types';
import { Rating } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import { testIds } from '@/lib/testIds';
import { mediaSrcSet } from '@/lib/images';

import styles from './CompareTable.module.css';

export interface CompareColumnHeadProps {
  product: ProductSummary;
  onRemove: (product: ProductSummary) => void;
}

/** Image on cream, name, price and rating with review count (DESIGN_SPEC §4.5). */
export function CompareColumnHead({ product, onRemove }: CompareColumnHeadProps) {
  const ids = testIds.compareColumn(product.slug);
  return (
    <th scope="col" className={styles.product} data-testid={ids.root}>
      <div className={styles.media}>
        {product.image_url ? (
          <img
            src={product.image_url}
            srcSet={mediaSrcSet(product.image_url)}
            sizes="(min-width: 1024px) 280px, 240px"
            alt=""
            width={280}
            height={177}
            className={styles.image}
          />
        ) : (
          <ImageOff size={32} aria-hidden="true" />
        )}
        <button
          type="button"
          className={styles.remove}
          onClick={() => onRemove(product)}
          aria-label={`Remove ${product.name} from comparison`}
          data-testid={ids.remove}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <Link to={`/product/${product.slug}`} className={styles.name} data-testid={ids.name}>
        {product.name}
      </Link>
      <p className={styles.price} data-testid={ids.price}>
        {formatPrice(product.price_minor)}
      </p>
      <p className={styles.rating} data-testid={ids.rating}>
        <span>{product.rating_avg.toFixed(1)}</span>
        <Rating value={product.rating_avg} size={14} />
        <span className={styles.reviews}>
          {product.review_count} Review{product.review_count === 1 ? '' : 's'}
        </span>
      </p>
    </th>
  );
}
