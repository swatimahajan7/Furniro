import { useParams } from 'react-router';

import { ComingSoon, PageShell } from '@/components/layout';

export default function BlogPostPage() {
  const { slug = '' } = useParams();
  return (
    <PageShell
      title="Blog"
      name="blog-post"
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: slug }]}
      featureStrip
    >
      <ComingSoon phase={6} what="This article" />
    </PageShell>
  );
}
