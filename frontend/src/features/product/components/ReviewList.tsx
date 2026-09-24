import { MessageSquare } from 'lucide-react';
import { lazy, Suspense } from 'react';

import { Button, EmptyState, ErrorState, Rating, Skeleton } from '@/components/ui';
import { formatDate } from '@/lib/format';

import { useReviews } from '../api';

import styles from './ReviewList.module.css';

export interface ReviewListProps {
  slug: string;
  /** Reviews load only once the tab is opened. */
  active: boolean;
}

// The form (and zod with it) loads only when the Reviews tab is opened, keeping it off the
// product page's critical path.
const ReviewForm = lazy(() => import('./ReviewForm').then((m) => ({ default: m.ReviewForm })));

/** The review form sits above every state, so posting the first review keeps its "thanks". */
export function ReviewList({ slug, active }: ReviewListProps) {
  return (
    <div className={styles.wrap}>
      {active && (
        <Suspense fallback={null}>
          <ReviewForm slug={slug} />
        </Suspense>
      )}
      <Reviews slug={slug} active={active} />
    </div>
  );
}

function Reviews({ slug, active }: ReviewListProps) {
  const reviews = useReviews(slug, active);

  if (reviews.isPending) {
    return (
      <div className={styles.list} aria-busy="true">
        {[1, 2].map((n) => (
          <Skeleton key={n} height={96} rounded />
        ))}
      </div>
    );
  }
  if (reviews.isError) {
    return <ErrorState onRetry={() => void reviews.refetch()} data-testid="pdp-reviews-error" />;
  }

  const items = reviews.data.pages.flatMap((page) => page.items);
  if (items.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        message="Be the first to share what you think."
        data-testid="pdp-reviews-empty"
      />
    );
  }

  return (
    <>
      <ul className={styles.list} data-testid="pdp-reviews" data-count={items.length}>
        {items.map((review) => (
          <li key={review.id} className={styles.review} data-testid={`pdp-review-${review.id}`}>
            <div className={styles.header}>
              <Rating value={review.rating} size={16} />
              <span className={styles.author}>{review.author_name}</span>
              <time className={styles.date} dateTime={review.created_at}>
                {formatDate(review.created_at)}
              </time>
            </div>
            <p className={styles.comment}>{review.comment}</p>
          </li>
        ))}
      </ul>
      {reviews.hasNextPage && (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => void reviews.fetchNextPage()}
          isLoading={reviews.isFetchingNextPage}
          data-testid="pdp-reviews-more"
        >
          Load more reviews
        </Button>
      )}
    </>
  );
}
