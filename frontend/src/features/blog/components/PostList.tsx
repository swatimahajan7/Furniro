import { Newspaper } from 'lucide-react';
import { Link } from 'react-router';

import { ButtonLink, EmptyState, ErrorState, Pagination, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';

import { useBlogCategories, useBlogPosts } from '../api';
import { blogHref, type BlogParams } from '../blogParams';

import styles from './Blog.module.css';
import { PostCard } from './PostCard';

/** Posts for the URL state, with filter summary, pagination and every list state. */
export function PostList({ params }: { params: BlogParams }) {
  const posts = useBlogPosts(params);
  const categories = useBlogCategories();
  const categoryName =
    categories.data?.find((c) => c.slug === params.category)?.name ?? params.category;
  const isFiltered = Boolean(params.category || params.q);

  if (posts.isPending) {
    return (
      <div className={styles.main} aria-busy="true" data-testid="blog-loading">
        {[1, 2].map((n) => (
          <Skeleton key={n} height={620} rounded />
        ))}
      </div>
    );
  }
  if (posts.isError) {
    return <ErrorState onRetry={() => void posts.refetch()} data-testid="blog-error" />;
  }

  const { items, total, total_pages: totalPages } = posts.data;
  const summary = isFiltered && (
    <p className={styles.summary} role="status" data-testid="blog-filter-summary">
      <span>
        {total} post{total === 1 ? '' : 's'}
        {params.category && <> in {categoryName}</>}
        {params.q && <> matching “{params.q}”</>}
      </span>
      <Link to="/blog" className={styles.clear} data-testid="blog-clear-filters">
        Show all posts
      </Link>
    </p>
  );

  if (total === 0) {
    return (
      <>
        {summary}
        <EmptyState
          icon={Newspaper}
          title="No posts found"
          message="Try another search or browse all categories."
          data-testid="blog-empty"
        />
      </>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="This page does not exist"
        message={`There ${totalPages === 1 ? 'is only 1 page' : `are only ${totalPages} pages`} of posts.`}
        action={
          <ButtonLink
            to={blogHref({ ...params, page: 1 })}
            variant="outline-primary"
            data-testid="blog-first-page"
          >
            Go to the first page
          </ButtonLink>
        }
        data-testid="blog-page-out-of-range"
      />
    );
  }

  return (
    <>
      {summary}
      <div
        className={cn(styles.main, posts.isPlaceholderData && styles.refreshing)}
        aria-busy={posts.isPlaceholderData || undefined}
        data-testid="blog-posts"
        data-total={total}
      >
        {items.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination
        page={params.page}
        totalPages={totalPages}
        hrefFor={(page) => blogHref({ ...params, page })}
        className={styles.pagination}
        data-testid="blog-pagination"
      />
    </>
  );
}
