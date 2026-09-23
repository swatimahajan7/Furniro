import { useCallback } from 'react';

import type { ProductSummary } from '@/api/types';
import { useToast } from '@/components/ui';

/**
 * Card and product-page actions in one place. Add to cart is wired in Phase 4, and compare
 * and like in Phase 5; until then they confirm with an info toast so no button is dead.
 */
export function useProductActions() {
  const toast = useToast();

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

  const addToCart = useCallback(
    (product: Pick<ProductSummary, 'name'>) => {
      toast.info(`The cart opens in Phase 4. ${product.name} will be addable then.`);
    },
    [toast],
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

  return { share, addToCart, compare, like };
}
