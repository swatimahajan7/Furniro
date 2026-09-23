import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { BlogCategory, BlogPost, BlogPostPage, BlogPostSummary } from '@/api/types';

import { BLOG_PAGE_SIZE, type BlogParams } from './blogParams';

export function useBlogPosts({ page, category, q }: BlogParams) {
  const query = { page, page_size: BLOG_PAGE_SIZE, category, q };
  return useQuery({
    queryKey: queryKeys.blog.posts(query),
    queryFn: ({ signal }) => apiFetch<BlogPostPage>('/blog/posts', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: queryKeys.blog.post(slug),
    queryFn: ({ signal }) =>
      apiFetch<BlogPost>(`/blog/posts/${encodeURIComponent(slug)}`, { signal }),
    enabled: slug !== '',
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: queryKeys.blog.categories,
    queryFn: ({ signal }) => apiFetch<BlogCategory[]>('/blog/categories', { signal }),
  });
}

export function useRecentPosts() {
  return useQuery({
    queryKey: queryKeys.blog.recent,
    queryFn: ({ signal }) =>
      apiFetch<BlogPostSummary[]>('/blog/posts/recent', { query: { limit: 5 }, signal }),
  });
}
