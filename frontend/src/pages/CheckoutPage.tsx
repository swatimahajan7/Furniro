import { ComingSoon, PageShell } from '@/components/layout';

export default function CheckoutPage() {
  return (
    <PageShell title="Checkout" featureStrip>
      <ComingSoon phase={4} what="Checkout" />
    </PageShell>
  );
}
