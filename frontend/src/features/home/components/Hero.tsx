import { ButtonLink } from '@/components/ui';

import styles from './Hero.module.css';
import { mediaSrcSet } from '@/lib/images';

/** Home hero: full-width photo with the "New Arrival" card (DESIGN_SPEC §4.1). Holds the page h1. */
export function Hero() {
  return (
    <section className={styles.hero} data-testid="home-hero">
      <img
        className={styles.image}
        src="/media/banners/hero-home.webp"
        srcSet={mediaSrcSet('/media/banners/hero-home.webp')}
        sizes="100vw"
        alt="A bright room with a rattan chair, a potted palm and a white sideboard"
        width={1600}
        height={1120}
        fetchPriority="high"
      />
      <div className={styles.inner}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>New Arrival</p>
          <h1 className={styles.title}>Discover Our New Collection</h1>
          <p className={styles.text}>
            Warm woods, soft textures and pieces made to be lived with. Our new collection is here
            for every room in your home.
          </p>
          <ButtonLink
            to="/shop"
            size="lg"
            uppercase
            className={styles.cta}
            data-testid="home-buy-now"
          >
            Buy Now
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
