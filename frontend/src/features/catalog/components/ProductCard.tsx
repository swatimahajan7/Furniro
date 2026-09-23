import { ArrowLeftRight, Heart, ImageOff, Share2 } from 'lucide-react';
import { Link } from 'react-router';

import type { ProductSummary } from '@/api/types';
import { Badge, Button, Rating } from '@/components/ui';
import { useIsLiked } from '@/features/wishlist';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import { testIds } from '@/lib/testIds';

import { useProductActions } from '../useProductActions';

import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: ProductSummary;
  variant?: 'grid' | 'list';
}

/**
 * DESIGN_SPEC §3 ProductCard. The name link stretches over the whole card; the hover overlay
 * (Add to cart, Share, Compare, Like) sits above it and also appears on keyboard focus.
 */
export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const ids = testIds.productCard(product.slug);
  const actions = useProductActions();
  const isLiked = useIsLiked(product.id);
  const onSale = product.discount_percent !== null && product.compare_at_price_minor !== null;

  return (
    <article
      className={cn(styles.card, styles[variant], !product.in_stock && styles.soldOut)}
      data-testid={ids.root}
      data-in-stock={product.in_stock}
    >
      <div className={styles.media}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt=""
            loading="lazy"
            width={285}
            height={301}
            className={styles.image}
          />
        ) : (
          <div className={styles.noImage}>
            <ImageOff size={40} aria-hidden="true" />
          </div>
        )}
        {onSale ? (
          <Badge variant="sale" className={styles.badge} data-testid={ids.badge}>
            -{product.discount_percent}%
          </Badge>
        ) : (
          product.is_new && (
            <Badge variant="new" className={styles.badge} data-testid={ids.badge}>
              New
            </Badge>
          )
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link to={`/product/${product.slug}`} className={styles.link} data-testid={ids.link}>
            <span data-testid={ids.name}>{product.name}</span>
          </Link>
        </h3>
        <p className={styles.subtitle}>{product.subtitle}</p>
        {variant === 'list' && product.review_count > 0 && (
          <div className={styles.rating}>
            <Rating value={product.rating_avg} size={16} />
            <span>({product.review_count})</span>
          </div>
        )}
        <p className={styles.prices}>
          <span className={styles.price} data-testid={ids.price}>
            {formatPrice(product.price_minor)}
          </span>
          {onSale && product.compare_at_price_minor !== null && (
            <s className={styles.oldPrice} data-testid={ids.oldPrice}>
              <span className="visuallyHidden">Was </span>
              {formatPrice(product.compare_at_price_minor)}
            </s>
          )}
        </p>
        {!product.in_stock && <p className={styles.stock}>Out of stock</p>}
      </div>

      <div className={styles.overlay}>
        <Button
          variant="light"
          size="sm"
          className={styles.addToCart}
          onClick={() => void actions.addToCart(product)}
          disabled={!product.in_stock}
          isLoading={actions.addingId === product.id}
          aria-label={`Add ${product.name} to cart`}
          data-testid={ids.addToCart}
        >
          {product.in_stock ? 'Add to cart' : 'Out of stock'}
        </Button>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            onClick={() => void actions.share(product)}
            aria-label={`Share ${product.name}`}
            data-testid={ids.share}
          >
            <Share2 size={16} aria-hidden="true" /> Share
          </button>
          <button
            type="button"
            className={styles.action}
            onClick={() => actions.compare(product)}
            aria-label={`Compare ${product.name}`}
            data-testid={ids.compare}
          >
            <ArrowLeftRight size={16} aria-hidden="true" /> Compare
          </button>
          <button
            type="button"
            className={cn(styles.action, isLiked && styles.liked)}
            onClick={() => actions.like(product)}
            aria-label={`Like ${product.name}`}
            aria-pressed={isLiked}
            data-testid={ids.like}
          >
            <Heart size={16} aria-hidden="true" /> {isLiked ? 'Liked' : 'Like'}
          </button>
        </div>
      </div>
    </article>
  );
}
