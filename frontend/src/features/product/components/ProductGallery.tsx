import { ImageOff } from 'lucide-react';
import { useState } from 'react';

import type { ProductDetail } from '@/api/types';
import { cn } from '@/lib/cn';

import styles from './ProductGallery.module.css';

export interface ProductGalleryProps {
  images: ProductDetail['images'];
  productName: string;
}

/** Thumbnails beside a main image; clicking a thumbnail swaps the main image (FR-PDP-01). */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const gallery = images.filter((image) => image.kind === 'gallery');
  const [selected, setSelected] = useState(0);
  const current = gallery[selected] ?? gallery[0];

  return (
    <div className={styles.gallery} data-testid="pdp-gallery">
      {gallery.length > 1 && (
        <ul className={styles.thumbs} aria-label="Product images">
          {gallery.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                className={cn(styles.thumb, index === selected && styles.thumbActive)}
                onClick={() => setSelected(index)}
                aria-label={`Show image ${index + 1} of ${gallery.length}`}
                aria-pressed={index === selected}
                data-testid={`pdp-thumbnail-${index + 1}`}
              >
                <img src={image.url} alt="" width={76} height={80} className={styles.thumbImage} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.main}>
        {current ? (
          <img
            src={current.url}
            alt={current.alt || productName}
            width={423}
            height={500}
            className={styles.mainImage}
            data-testid="pdp-main-image"
            data-index={selected + 1}
          />
        ) : (
          <ImageOff size={48} aria-label="No image available" />
        )}
      </div>
    </div>
  );
}
