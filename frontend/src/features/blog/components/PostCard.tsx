import { Link } from 'react-router';

import type { BlogPostSummary } from '@/api/types';
import { testIds } from '@/lib/testIds';
import { mediaSrcSet } from '@/lib/images';

import styles from './Blog.module.css';
import { PostMeta } from './PostMeta';

/** Blog card (DESIGN_SPEC §3): cover, meta row, title, excerpt, "Read more". */
export function PostCard({ post }: { post: BlogPostSummary }) {
  const ids = testIds.blogPost(post.slug);
  const href = `/blog/${post.slug}`;
  return (
    <article className={styles.card} data-testid={ids.root}>
      <Link to={href} className={styles.cover} tabIndex={-1} aria-hidden="true">
        <img
          src={post.cover_url}
          srcSet={mediaSrcSet(post.cover_url)}
          sizes="(min-width: 1024px) 817px, 100vw"
          alt=""
          width={817}
          height={500}
          loading="lazy"
          className={styles.coverImage}
        />
      </Link>
      <PostMeta post={post} data-testid={ids.meta} />
      <h2 className={styles.cardTitle}>
        <Link to={href} data-testid={ids.link}>
          {post.title}
        </Link>
      </h2>
      <p className={styles.excerpt}>{post.excerpt}</p>
      <Link to={href} className={styles.readMore} data-testid={ids.readMore}>
        Read more<span className="visuallyHidden">: {post.title}</span>
      </Link>
    </article>
  );
}
