import { useCallback } from 'react';

import type { ProductSummary } from '@/api/types';
import { useToast } from '@/components/ui';
import { useAddToCart, useCartDrawer } from '@/features/cart';
import { COMPARE_LIMIT, useCompareStore } from '@/features/compare';
import { useToggleLike } from '@/features/wishlist';
import { errorMessage } from '@/lib/errors';

export interface AddToCartOptions {
  quantity?: number;
  size?: string | null;
  color?: string | null;
}

type CartProduct = Pick<ProductSummary, 'id' | 'name' | 'sizes' | 'colors'>;

/**
 * Card, product-page and comparison actions in one place: add to cart (opens the cart drawer,
 * FR-PDP-07), share, compare (FR-CMP-01) and like (FR-WISH-01).
 */
export function useProductActions() {
  const toast = useToast();
  const add = useAddToCart();
  const openCart = useCartDrawer((state) => state.open);

  const share = useCallback(
    async (product: Pick<ProductSummary, 'slug' | 'name'>) => {
      const url = `${window.location.origin}/product/${product.slug}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success(`Link to ${product.name} copied`);
      } catch {
        toast.error('Could not copy the link. Copy it from the address bar instead.');
      }
    },
    [toast],
  );

  /** Without explicit options the first size and colour are used, as on the product page. */
  const addToCart = useCallback(
    async (product: CartProduct, options: AddToCartOptions = {}) => {
      try {
        await add.mutateAsync({
          product_id: product.id,
          quantity: options.quantity ?? 1,
          size: options.size ?? product.sizes[0] ?? null,
          color: options.color ?? product.colors[0]?.name ?? null,
        });
        openCart();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    },
    [add, openCart, toast],
  );

  const addToCompare = useCompareStore((state) => state.add);
  const compare = useCallback(
    (product: Pick<ProductSummary, 'id' | 'name'>) => {
      const result = addToCompare(product.id);
      if (result === 'added') toast.success(`${product.name} added to the comparison`);
      else if (result === 'exists') toast.info(`${product.name} is already in the comparison`);
      else toast.error(`You can compare up to ${COMPARE_LIMIT} products. Remove one first.`);
    },
    [addToCompare, toast],
  );

  const like = useToggleLike();

  return {
    share,
    addToCart,
    isAdding: add.isPending,
    /** The product whose add is in flight, so only its button shows a spinner. */
    addingId: add.isPending ? add.variables.product_id : null,
    compare,
    like,
  };
}
