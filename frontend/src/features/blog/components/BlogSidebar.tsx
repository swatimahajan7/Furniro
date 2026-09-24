import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { ErrorState, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { testIds } from '@/lib/testIds';

import { useBlogCategories, useRecentPosts } from '../api';
import { blogHref } from '../blogParams';

import styles from './Blog.module.css';
import { mediaSrcSet } from '@/lib/images';

export interface BlogSidebarProps {
  /** The category being shown, highlighted in the list. */
  activeCategory?: string | null;
  /** The current search, so the box shows what the list is filtered by. */
  query?: string | null;
}

/** Search, Categories with counts and Recent Posts (DESIGN_SPEC §3 "Sidebar"). */
export function BlogSidebar({ activeCategory = null, query = null }: BlogSidebarProps) {
  const categories = useBlogCategories();
  const recent = useRecentPosts();
  const navigate = useNavigate();
  const [text, setText] = useState(query ?? '');

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate(blogHref({ q: text.trim(), category: activeCategory }));
  };

  return (
    <aside className={styles.sidebar} aria-label="Blog" data-testid="blog-sidebar">
      <form
        role="search"
        className={styles.search}
        onSubmit={handleSearch}
        data-testid="blog-search-form"
      >
        <label htmlFor="blog-search" className="visuallyHidden">
          Search the blog
        </label>
        <input
          id="blog-search"
          type="search"
          className={styles.searchInput}
          value={text}
          maxLength={100}
          onChange={(event) => setText(event.target.value)}
          data-testid="blog-search-field-q"
        />
        <button
          type="submit"
          className={styles.searchButton}
          aria-label="Search"
          data-testid="blog-search-submit"
        >
          <Search size={20} aria-hidden="true" />
        </button>
      </form>

      <section className={styles.panel} aria-labelledby="blog-categories-title">
        <h2 id="blog-categories-title" className={styles.panelTitle}>
          Categories
        </h2>
        {categories.isPending ? (
          <Skeleton height={180} rounded />
        ) : categories.isError ? (
          <ErrorState
            compact
            message="We could not load the categories."
            onRetry={() => void categories.refetch()}
            data-testid="blog-categories-error"
          />
        ) : (
          <ul className={styles.categories} data-testid="blog-categories">
            {(categories.data ?? []).map((category) => {
              const ids = testIds.blogCategory(category.slug);
              const isActive = category.slug === activeCategory;
              return (
                <li key={category.slug}>
                  <Link
                    to={blogHref({ category: category.slug, q: query })}
                    className={cn(styles.category, isActive && styles.categoryActive)}
                    aria-current={isActive ? 'page' : undefined}
                    data-testid={ids.link}
                  >
                    <span>{category.name}</span>
                    <span data-testid={ids.count}>
                      <span className="visuallyHidden">(</span>
                      {category.post_count}
                      <span className="visuallyHidden"> posts)</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="blog-recent-title">
        <h2 id="blog-recent-title" className={styles.panelTitle}>
          Recent Posts
        </h2>
        {recent.isPending ? (
          <Skeleton height={400} rounded />
        ) : recent.isError ? (
          <ErrorState
            compact
            message="We could not load the recent posts."
            onRetry={() => void recent.refetch()}
            data-testid="blog-recent-error"
          />
        ) : (
          <ul className={styles.recent} data-testid="blog-recent">
            {(recent.data ?? []).map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className={styles.recentItem}
                  data-testid={testIds.blogRecent(post.slug)}
                >
                  <img
                    src={post.cover_url}
                    srcSet={mediaSrcSet(post.cover_url)}
                    sizes="80px"
                    alt=""
                    width={80}
                    height={80}
                    loading="lazy"
                    className={styles.recentImage}
                  />
                  <span className={styles.recentText}>
                    <span className={styles.recentTitle}>{post.title}</span>
                    <time className={styles.recentDate} dateTime={post.published_at}>
                      {formatDate(post.published_at)}
                    </time>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
