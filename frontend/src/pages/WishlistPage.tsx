import { Heart } from 'lucide-react';

import { PageShell } from '@/components/layout';
import { ButtonLink, EmptyState, ErrorState } from '@/components/ui';
import { RequireAuth } from '@/features/auth';
import { ProductGrid } from '@/features/catalog';
import { useWishlist } from '@/features/wishlist';

import styles from './WishlistPage.module.css';

function Wishlist() {
  const wishlist = useWishlist();

  if (wishlist.isError) {
    return <ErrorState onRetry={() => void wishlist.refetch()} data-testid="wishlist-error" />;
  }
  if (wishlist.data?.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        message="Tap Like on any product to save it here."
        action={
          <ButtonLink to="/shop" variant="primary" data-testid="wishlist-continue-shopping">
            Browse the shop
          </ButtonLink>
        }
        data-testid="wishlist-empty"
      />
    );
  }
  const count = wishlist.data?.length ?? 0;
  return (
    <>
      <h2 className="visuallyHidden">Saved products</h2>
      {wishlist.data && (
        <p className={styles.count} data-testid="wishlist-count">
          {count} saved product{count === 1 ? '' : 's'}
        </p>
      )}
      <ProductGrid
        products={wishlist.data}
        isLoading={wishlist.isPending}
        skeletonCount={4}
        data-testid="wishlist-products"
      />
    </>
  );
}

export default function WishlistPage() {
  return (
    <PageShell
      title="Wishlist"
      name="wishlist"
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]}
      featureStrip
    >
      <div className={`container ${styles.page}`}>
        <RequireAuth>
          <Wishlist />
        </RequireAuth>
      </div>
    </PageShell>
  );
}
