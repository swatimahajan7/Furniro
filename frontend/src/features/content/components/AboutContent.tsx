import { ButtonLink } from '@/components/ui';

import styles from './Content.module.css';
import { mediaSrcSet } from '@/lib/images';

const VALUES = [
  {
    id: 'materials',
    title: 'Honest materials',
    text: 'Solid woods, natural fabrics and finishes that can be repaired rather than replaced.',
  },
  {
    id: 'makers',
    title: 'Made with care',
    text: 'We work with small workshops and know the people who build every piece we sell.',
  },
  {
    id: 'service',
    title: 'Here to help',
    text: 'Free delivery, a 30-day return window and real people on the other end of the phone.',
  },
];

/** About page body: story, values and next steps. Placeholder copy (PLAN.md §2.1). */
export function AboutContent() {
  return (
    <div className={styles.about}>
      <section
        className={styles.story}
        aria-labelledby="about-story-title"
        data-testid="about-story"
      >
        <img
          src="/media/rooms/living.webp"
          srcSet={mediaSrcSet('/media/rooms/living.webp')}
          sizes="(min-width: 1024px) 600px, 100vw"
          alt="A bright living room furnished by Furniro"
          width={600}
          height={480}
          loading="lazy"
          className={styles.storyImage}
        />
        <div className={styles.storyText}>
          <p className={styles.eyebrow}>Our story</p>
          <h2 id="about-story-title" className={styles.storyTitle}>
            Furniture made to be lived with
          </h2>
          <p>
            Furniro started with a simple idea: a home should feel calm, personal and easy to live
            in. We choose every sofa, table and lamp for how it looks, how it is made and how it
            will feel after years of everyday use.
          </p>
          <p>
            Today we bring together pieces from makers we trust, so you can furnish a whole home
            with things that belong together.
          </p>
        </div>
      </section>

      <ul className={styles.values} data-testid="about-values">
        {VALUES.map((value) => (
          <li key={value.id} className={styles.value} data-testid={`about-value-${value.id}`}>
            <h3 className={styles.valueTitle}>{value.title}</h3>
            <p>{value.text}</p>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <ButtonLink to="/shop" variant="primary" data-testid="about-shop-link">
          Browse the shop
        </ButtonLink>
        <ButtonLink to="/contact" variant="outline-primary" data-testid="about-contact-link">
          Get in touch
        </ButtonLink>
      </div>
    </div>
  );
}
