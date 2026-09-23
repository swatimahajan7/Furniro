import { ComingSoon, PageShell } from '@/components/layout';

export default function CartPage() {
  return (
    <PageShell title="Cart" featureStrip>
      <ComingSoon phase={4} what="Your cart" />
    </PageShell>
  );
}
