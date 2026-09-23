import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import type { ProductDetail } from '@/api/types';
import { Button, QuantityStepper, Rating } from '@/components/ui';
import { useProductActions } from '@/features/catalog';
import { formatPrice } from '@/lib/format';

import { OptionPicker } from './OptionPicker';
import styles from './ProductInfo.module.css';
import { ShareLinks } from './ShareLinks';

const MAX_QUANTITY = 10;
const LOW_STOCK = 5;

export interface ProductInfoProps {
  product: ProductDetail;
  /** Opens the Reviews tab (the "N Customer Review" link). */
  onShowReviews: () => void;
}

/** The right-hand column of the product page (DESIGN_SPEC §4.3). */
export function ProductInfo({ product, onShowReviews }: ProductInfoProps) {
  const actions = useProductActions();
  // First option preselected (FR-PDP-02).
  const [size, setSize] = useState(product.sizes[0] ?? '');
  const [color, setColor] = useState(product.colors[0]?.name ?? '');
  const maxQuantity = Math.min(MAX_QUANTITY, product.stock);
  const [quantity, setQuantity] = useState(1);
  const onSale = product.compare_at_price_minor !== null;

  return (
    <div className={styles.info}>
      <h1 className={styles.name} data-testid="pdp-title">
        {product.name}
      </h1>
      <p className={styles.prices}>
        <span data-testid="pdp-price">{formatPrice(product.price_minor)}</span>
        {onSale && product.compare_at_price_minor !== null && (
          <s className={styles.oldPrice} data-testid="pdp-old-price">
            <span className="visuallyHidden">Was </span>
            {formatPrice(product.compare_at_price_minor)}
          </s>
        )}
      </p>

      <div className={styles.ratingRow}>
        <Rating value={product.rating_avg} data-testid="pdp-rating" />
        <span className={styles.ratingDivider} aria-hidden="true" />
        <button
          type="button"
          className={styles.reviewLink}
          onClick={onShowReviews}
          data-testid="pdp-review-count"
        >
          {product.review_count} Customer Review{product.review_count === 1 ? '' : 's'}
        </button>
      </div>

      <p className={styles.summary} data-testid="pdp-short-description">
        {product.short_description}
      </p>

      {product.sizes.length > 0 && (
        <OptionPicker
          label="Size"
          value={size}
          onChange={setSize}
          options={product.sizes.map((s) => ({ value: s, label: s }))}
          data-testid="pdp-size"
        />
      )}
      {product.colors.length > 0 && (
        <OptionPicker
          label="Color"
          value={color}
          onChange={setColor}
          options={product.colors.map((c) => ({ value: c.name, label: c.name, hex: c.hex }))}
          data-testid="pdp-color"
        />
      )}

      {product.in_stock ? (
        product.stock <= LOW_STOCK && (
          <p className={styles.lowStock} data-testid="pdp-stock">
            Only {product.stock} left in stock
          </p>
        )
      ) : (
        <p className={styles.outOfStock} data-testid="pdp-stock">
          Out of stock
        </p>
      )}

      <div className={styles.buy}>
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={Math.max(maxQuantity, 1)}
          disabled={!product.in_stock}
          label={`Quantity of ${product.name}`}
          data-testid="pdp-qty"
        />
        <Button
          variant="outline-dark"
          className={styles.buyButton}
          onClick={() =>
            void actions.addToCart(product, { quantity, size: size || null, color: color || null })
          }
          disabled={!product.in_stock}
          isLoading={actions.isAdding}
          data-testid="pdp-add-to-cart"
        >
          Add To Cart
        </Button>
        <Button
          variant="outline-dark"
          className={styles.buyButton}
          onClick={() => actions.compare(product)}
          data-testid="pdp-compare"
        >
          <Plus size={18} aria-hidden="true" /> Compare
        </Button>
      </div>

      <dl className={styles.meta} data-testid="pdp-meta">
        <dt>SKU</dt>
        <dd data-testid="pdp-sku">{product.sku}</dd>
        <dt>Category</dt>
        <dd>
          <Link
            to={`/shop?category=${product.category.slug}`}
            className={styles.metaLink}
            data-testid="pdp-category"
          >
            {product.category.name}
          </Link>
        </dd>
        <dt>Tags</dt>
        <dd data-testid="pdp-tags">{product.tags.join(', ')}</dd>
        <dt>Share</dt>
        <dd>
          <ShareLinks
            url={`${window.location.origin}/product/${product.slug}`}
            title={product.name}
          />
        </dd>
      </dl>
    </div>
  );
}
