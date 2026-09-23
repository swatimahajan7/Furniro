import { useParams } from 'react-router';

import { ComingSoon, PageShell } from '@/components/layout';

export default function OrderConfirmationPage() {
  const { orderNumber = '' } = useParams();
  return (
    <PageShell
      title="Order Confirmation"
      name="order-confirmation"
      crumbs={[{ label: 'Home', to: '/' }, { label: `Order ${orderNumber}` }]}
    >
      <ComingSoon phase={4} what="Your order confirmation" />
    </PageShell>
  );
}
