import { useParams } from 'react-router';

import { Breadcrumb, ComingSoon, PageShell } from '@/components/layout';

/** "asgaard-sofa" → "Asgaard sofa" until Phase 3 loads the real product name. */
const titleFromSlug = (slug: string) => {
  const words = slug.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export default function ProductPage() {
  const { slug = '' } = useParams();
  const name = titleFromSlug(slug);
  return (
    <PageShell title={name} name="product" banner={false}>
      <Breadcrumb
        variant="bar"
        items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: name }]}
      />
      <ComingSoon phase={3} what="The product page" />
    </PageShell>
  );
}
