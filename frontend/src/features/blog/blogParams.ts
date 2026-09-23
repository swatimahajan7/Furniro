/** Blog list state in the URL (`/blog?page=2&category=wood&q=sofa`), so any view can be linked. */
export interface BlogParams {
  page: number;
  category: string | null;
  q: string | null;
}

export const BLOG_PAGE_SIZE = 3;

export function parseBlogParams(search: URLSearchParams): BlogParams {
  const page = Number.parseInt(search.get('page') ?? '', 10);
  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    category: search.get('category')?.trim() || null,
    q: search.get('q')?.trim().slice(0, 100) || null,
  };
}

/** `/blog?…` for the given state; page 1 and empty values are left out. */
export function blogHref({ page, category, q }: Partial<BlogParams>): string {
  const search = new URLSearchParams();
  if (category) search.set('category', category);
  if (q) search.set('q', q);
  if (page && page > 1) search.set('page', String(page));
  const text = search.toString();
  return text ? `/blog?${text}` : '/blog';
}
