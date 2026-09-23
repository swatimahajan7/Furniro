import { ComingSoon, PageShell } from '@/components/layout';

export default function ShopPage() {
  return (
    <PageShell title="Shop" showMark={false} featureStrip>
      <ComingSoon phase={3} what="The shop" />
    </PageShell>
  );
}
