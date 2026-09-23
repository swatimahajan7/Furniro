import { ComingSoon, PageShell } from '@/components/layout';

export default function ComparePage() {
  return (
    <PageShell
      title="Product Comparison"
      name="compare"
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Comparison' }]}
      featureStrip
    >
      <ComingSoon phase={5} what="Product comparison" />
    </PageShell>
  );
}
