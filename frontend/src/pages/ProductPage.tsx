import { PackageX } from 'lucide-react';
import { useParams } from 'react-router';

import { Breadcrumb, PageShell } from '@/components/layout';
import { ButtonLink, EmptyState, ErrorState } from '@/components/ui';
import {
  isNotFound,
  ProductDetailSkeleton,
  ProductDetailView,
  useProduct,
} from '@/features/product';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const product = useProduct(slug);

  if (product.isError && isNotFound(product.error)) {
    return (
      <PageShell title="Product not found" name="product-not-found" banner={false}>
        <Breadcrumb
          variant="bar"
          items={[
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/shop' },
            { label: 'Not found' },
          ]}
        />
        <div className="container">
          <EmptyState
            icon={PackageX}
            title="We couldn’t find that product"
            message="It may have been removed, or the link may be wrong."
            action={
              <ButtonLink to="/shop" variant="primary" data-testid="pdp-not-found-shop">
                Back to the shop
              </ButtonLink>
            }
            data-testid="pdp-not-found"
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={product.data?.name ?? 'Product'}
      name="product"
      banner={false}
      srHeading={!product.data}
    >
      {product.isError ? (
        <div className="container">
          <ErrorState onRetry={() => void product.refetch()} data-testid="pdp-error" />
        </div>
      ) : product.data ? (
        <ProductDetailView key={product.data.slug} product={product.data} />
      ) : (
        <ProductDetailSkeleton />
      )}
    </PageShell>
  );
}
