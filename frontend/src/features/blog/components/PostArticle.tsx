import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

import type { BlogPost } from '@/api/types';
import { mediaSrcSet } from '@/lib/images';

import styles from './Blog.module.css';
import { PostContent } from './PostContent';
import { PostMeta } from './PostMeta';

/** One article: cover, meta row, content and a way back to the list. */
export function PostArticle({ post }: { post: BlogPost }) {
  return (
    <article className={styles.article} data-testid="blog-article">
      <div className={styles.cover}>
        <img
          src={post.cover_url}
          srcSet={mediaSrcSet(post.cover_url)}
          sizes="(min-width: 1024px) 817px, 100vw"
          alt=""
          width={817}
          height={500}
          className={styles.coverImage}
        />
      </div>
      <PostMeta post={post} data-testid="blog-article-meta" />
      <PostContent content={post.content} />
      <Link to="/blog" className={styles.back} data-testid="blog-back">
        <ArrowLeft size={16} aria-hidden="true" /> Back to the blog
      </Link>
    </article>
  );
}
