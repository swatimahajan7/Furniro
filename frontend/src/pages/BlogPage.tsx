import { useSearchParams } from 'react-router';

import { PageShell } from '@/components/layout';
import { BlogLayout, BlogSidebar, PostList, parseBlogParams } from '@/features/blog';

export default function BlogPage() {
  const [search] = useSearchParams();
  const params = parseBlogParams(search);

  return (
    <PageShell title="Blog" featureStrip>
      <BlogLayout
        sidebar={
          // Keyed by the search so the box resets when the URL changes (e.g. "Show all posts").
          <BlogSidebar key={params.q ?? ''} activeCategory={params.category} query={params.q} />
        }
      >
        <PostList params={params} />
      </BlogLayout>
    </PageShell>
  );
}
