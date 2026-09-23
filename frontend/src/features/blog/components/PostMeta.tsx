import { Calendar, Tag, User } from 'lucide-react';
import { Link } from 'react-router';

import type { BlogPostSummary } from '@/api/types';
import { formatDate } from '@/lib/format';

import { blogHref } from '../blogParams';

import styles from './Blog.module.css';

/** Author · date · category, with the design's user / calendar / tag icons. */
export function PostMeta({
  post,
  'data-testid': testId,
}: {
  post: BlogPostSummary;
  'data-testid': string;
}) {
  return (
    <ul className={styles.meta} data-testid={testId}>
      <li>
        <User size={16} aria-hidden="true" />
        <span className="visuallyHidden">Author: </span>
        {post.author}
      </li>
      <li>
        <Calendar size={16} aria-hidden="true" />
        <span className="visuallyHidden">Published: </span>
        <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
      </li>
      <li>
        <Tag size={16} aria-hidden="true" />
        <span className="visuallyHidden">Category: </span>
        <Link
          to={blogHref({ category: post.category.slug })}
          className={styles.metaLink}
          data-testid={`${testId}-category`}
        >
          {post.category.name}
        </Link>
      </li>
    </ul>
  );
}
