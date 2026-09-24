import { Link } from 'react-router';

import { ErrorState, Skeleton } from '@/components/ui';
import { useRooms } from '@/features/catalog';

import styles from './BrowseRange.module.css';
import { mediaSrcSet } from '@/lib/images';

/** "Browse The Range": one tile per room, linking to the Shop filtered by that room. */
export function BrowseRange() {
  const rooms = useRooms();

  return (
    <section
      className={`container ${styles.section}`}
      aria-labelledby="browse-range-title"
      data-testid="home-browse-range"
    >
      <h2 id="browse-range-title" className={styles.title}>
        Browse The Range
      </h2>
      <p className={styles.subtitle}>Find the right pieces for every room in your home.</p>
      {rooms.isError && (
        <ErrorState
          compact
          message="We could not load the rooms."
          onRetry={() => void rooms.refetch()}
          data-testid="home-rooms-error"
        />
      )}
      <ul className={styles.tiles}>
        {rooms.isPending
          ? [1, 2, 3].map((n) => (
              <li key={n}>
                <Skeleton height={480} rounded />
              </li>
            ))
          : rooms.data?.map((room) => (
              <li key={room.slug}>
                <Link
                  to={`/shop?room=${room.slug}`}
                  className={styles.tile}
                  data-testid={`home-room-${room.slug}`}
                >
                  <img
                    src={room.image_url}
                    srcSet={mediaSrcSet(room.image_url)}
                    sizes="(min-width: 1024px) 381px, (min-width: 768px) 33vw, 100vw"
                    alt=""
                    loading="lazy"
                    width={381}
                    height={480}
                    className={styles.image}
                  />
                  <span className={styles.label}>{room.name}</span>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
}
