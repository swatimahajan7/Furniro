import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { parseShopParams, toSearchParams, type ShopParams } from './shopParams';

/**
 * Read and update the Shop state in the URL. Any change other than `page` or `view` resets
 * to page 1, so a new filter never lands on an empty page.
 */
export function useShopParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => parseShopParams(searchParams), [searchParams]);

  const update = useCallback(
    (changes: Partial<ShopParams>) => {
      const keepsPage = Object.keys(changes).every((key) => key === 'page' || key === 'view');
      const next = { ...params, ...changes, page: keepsPage ? (changes.page ?? params.page) : 1 };
      setSearchParams(toSearchParams(next));
    },
    [params, setSearchParams],
  );

  const hrefForPage = useCallback(
    (page: number) => {
      const search = toSearchParams({ ...params, page }).toString();
      return search ? `?${search}` : '?';
    },
    [params],
  );

  return { params, update, hrefForPage };
}
