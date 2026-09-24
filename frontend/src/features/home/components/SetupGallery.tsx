import styles from './SetupGallery.module.css';
import { mediaSrcSet } from '@/lib/images';

/** Static photos from the design (`backend/media/gallery`), in design order. */
const PHOTOS = [
  { file: 'funiro-01', alt: 'Open shelving with plants and books', w: 1155, h: 1300 },
  { file: 'funiro-02', alt: 'A desk with a laptop and a vintage radio', w: 1600, h: 796 },
  { file: 'funiro-03', alt: 'A leather armchair beside a bed', w: 868, h: 1300 },
  { file: 'funiro-04', alt: 'Two birch stools with a vase and a camera', w: 1600, h: 1066 },
  { file: 'funiro-05', alt: 'A dining table under a pendant lamp', w: 895, h: 1300 },
  { file: 'funiro-06', alt: 'A bedroom with an upholstered bench', w: 1600, h: 1066 },
  { file: 'funiro-07', alt: 'A picture frame and a vase of dried palm leaves', w: 867, h: 1300 },
  { file: 'funiro-08', alt: 'A kitchen wall shelf above the stove', w: 867, h: 1300 },
  { file: 'funiro-09', alt: 'A long dining table with pendant lights', w: 866, h: 1300 },
];

/** "Share your setup with #FuniroFurniture": a masonry-style photo wall. */
export function SetupGallery() {
  return (
    <section className={styles.section} aria-labelledby="setup-title" data-testid="home-gallery">
      <p className={styles.kicker}>Share your setup with</p>
      <h2 id="setup-title" className={styles.title}>
        #FuniroFurniture
      </h2>
      <ul className={styles.wall}>
        {PHOTOS.map((photo) => (
          <li key={photo.file} className={styles.item}>
            <img
              src={`/media/gallery/${photo.file}.webp`}
              srcSet={mediaSrcSet(`/media/gallery/${photo.file}.webp`)}
              sizes="(min-width: 1024px) 25vw, 50vw"
              alt={photo.alt}
              width={photo.w}
              height={photo.h}
              loading="lazy"
              className={styles.image}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
