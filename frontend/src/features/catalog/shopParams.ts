import type { QueryParams } from '@/api/client';
import type { ProductSort } from '@/api/types';

/**
 * Shop state lives in the URL (FR-CAT-07). The query-string keys mirror the API exactly
 * (prices in cents), so a Shop URL and the matching API call can be compared at a glance.
 */
export interface ShopParams {
  page: number;
  pageSize: number;
  sort: ProductSort;
  q: string;
  categories: string[];
  rooms: string[];
  /** US cents, inclusive. */
  minPrice: number | null;
  maxPrice: number | null;
  onSale: boolean;
  isNew: boolean;
  view: 'grid' | 'list';
}

export const PAGE_SIZES = [8, 16, 24, 32] as const;
export const DEFAULT_PAGE_SIZE = 16;

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

export const DEFAULT_SHOP_PARAMS: ShopParams = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  sort: 'default',
  q: '',
  categories: [],
  rooms: [],
  minPrice: null,
  maxPrice: null,
  onSale: false,
  isNew: false,
  view: 'grid',
};

const positiveInt = (raw: string | null): number | null => {
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
};

const isSort = (value: string | null): value is ProductSort =>
  SORT_OPTIONS.some((option) => option.value === value);

/** Parses the URL leniently: anything invalid falls back to its default instead of erroring. */
export function parseShopParams(search: URLSearchParams): ShopParams {
  const page = positiveInt(search.get('page'));
  const pageSize = positiveInt(search.get('page_size'));
  const sort = search.get('sort');
  const unique = (values: string[]) => [...new Set(values.filter(Boolean))];
  return {
    page: page && page >= 1 ? page : 1,
    pageSize:
      pageSize && (PAGE_SIZES as readonly number[]).includes(pageSize)
        ? pageSize
        : DEFAULT_PAGE_SIZE,
    sort: isSort(sort) ? sort : 'default',
    q: (search.get('q') ?? '').trim().slice(0, 100),
    categories: unique(search.getAll('category')),
    rooms: unique(search.getAll('room')),
    minPrice: positiveInt(search.get('min_price')),
    maxPrice: positiveInt(search.get('max_price')),
    onSale: search.get('on_sale') === 'true',
    isNew: search.get('is_new') === 'true',
    view: search.get('view') === 'list' ? 'list' : 'grid',
  };
}

/** Serialises back to the URL, leaving out defaults so links stay short. */
export function toSearchParams(params: ShopParams): URLSearchParams {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  params.categories.forEach((slug) => search.append('category', slug));
  params.rooms.forEach((slug) => search.append('room', slug));
  if (params.minPrice !== null) search.set('min_price', String(params.minPrice));
  if (params.maxPrice !== null) search.set('max_price', String(params.maxPrice));
  if (params.onSale) search.set('on_sale', 'true');
  if (params.isNew) search.set('is_new', 'true');
  if (params.sort !== 'default') search.set('sort', params.sort);
  if (params.pageSize !== DEFAULT_PAGE_SIZE) search.set('page_size', String(params.pageSize));
  if (params.page > 1) search.set('page', String(params.page));
  if (params.view === 'list') search.set('view', 'list');
  return search;
}

/** The API request for a Shop state (docs/API_CONTRACT.md §2.3). */
export function toApiQuery(params: ShopParams): QueryParams {
  // A reversed price range would be a 400 from the API; swap it instead.
  const [min, max] =
    params.minPrice !== null && params.maxPrice !== null && params.minPrice > params.maxPrice
      ? [params.maxPrice, params.minPrice]
      : [params.minPrice, params.maxPrice];
  return {
    q: params.q || undefined,
    category: params.categories,
    room: params.rooms,
    min_price: min,
    max_price: max,
    on_sale: params.onSale || undefined,
    is_new: params.isNew || undefined,
    sort: params.sort,
    page: params.page,
    page_size: params.pageSize,
  };
}

/** Number of active filters (not counting search, sort, paging or view). */
export function countActiveFilters(params: ShopParams): number {
  return (
    params.categories.length +
    params.rooms.length +
    (params.minPrice !== null ? 1 : 0) +
    (params.maxPrice !== null ? 1 : 0) +
    (params.onSale ? 1 : 0) +
    (params.isNew ? 1 : 0)
  );
}
