import { FileQuestion } from 'lucide-react';
import { useParams } from 'react-router';

import { ApiError } from '@/api/client';
import { PageShell } from '@/components/layout';
import { ButtonLink, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { BlogLayout, BlogSidebar, PostArticle, useBlogPost } from '@/features/blog';

export default function BlogPostPage() {
  const { slug = '' } = useParams();
  const post = useBlogPost(slug);
  const notFound = post.error instanceof ApiError && post.error.status === 404;

  let content;
  if (post.isPending) {
    content = (
      <div aria-busy="true" data-testid="blog-article-loading">
        <Skeleton height={500} rounded />
      </div>
    );
  } else if (notFound) {
    content = (
      <EmptyState
        icon={FileQuestion}
        title="We could not find that article"
        message="It may have been moved or renamed."
        action={
          <ButtonLink to="/blog" variant="outline-primary" data-testid="blog-article-back-to-list">
            Browse all posts
          </ButtonLink>
        }
        data-testid="blog-article-not-found"
      />
    );
  } else if (post.isError) {
    content = <ErrorState onRetry={() => void post.refetch()} data-testid="blog-article-error" />;
  } else {
    content = <PostArticle post={post.data} />;
  }

  const title = post.data?.title ?? (notFound ? 'Article Not Found' : 'Blog');
  return (
    <PageShell
      title={title}
      name="blog-post"
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: title }]}
      featureStrip
    >
      <BlogLayout sidebar={<BlogSidebar activeCategory={post.data?.category.slug} />}>
        {content}
      </BlogLayout>
    </PageShell>
  );
}
