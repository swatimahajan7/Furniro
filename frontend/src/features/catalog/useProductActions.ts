import { useCallback } from 'react';

import type { ProductSummary } from '@/api/types';
import { useToast } from '@/components/ui';
import { useAddToCart, useCartDrawer } from '@/features/cart';
import { errorMessage } from '@/lib/errors';

export interface AddToCartOptions {
  quantity?: number;
  size?: string | null;
  color?: string | null;
}

type CartProduct = Pick<ProductSummary, 'id' | 'name' | 'sizes' | 'colors'>;

/**
 * Card and product-page actions in one place. Add to cart is real (and opens the cart drawer,
 * FR-PDP-07); compare and like arrive in Phase 5 and confirm with an info toast until then.
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

  const compare = useCallback(
    (product: Pick<ProductSummary, 'name'>) => {
      toast.info(`Product comparison arrives in Phase 5 (${product.name}).`);
    },
    [toast],
  );

  const like = useCallback(
    (product: Pick<ProductSummary, 'name'>) => {
      toast.info(`Wishlists arrive in Phase 5 (${product.name}).`);
    },
    [toast],
  );

  return { share, addToCart, isAdding: add.isPending, compare, like };
}
