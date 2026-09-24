import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { ButtonLink, ErrorState, Skeleton } from '@/components/ui';
import { useInspirations } from '@/features/catalog';
import { cn } from '@/lib/cn';
import { mediaSrcSet } from '@/lib/images';

import styles from './InspirationSlider.module.css';

/**
 * "50+ Beautiful rooms inspiration" (DESIGN_SPEC §4.1). No autoplay: the slide only changes
 * when the user asks, which keeps the page predictable.
 */
export function InspirationSlider() {
  const inspirations = useInspirations();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  const slides = inspirations.data ?? [];

  return (
    <section
      className={styles.section}
      aria-labelledby="inspiration-title"
      data-testid="home-inspirations"
    >
      <div className={styles.intro}>
        <h2 id="inspiration-title" className={styles.title}>
          50+ Beautiful rooms inspiration
        </h2>
        <p className={styles.text}>
          Our designers have already made plenty of beautiful room prototypes to inspire you.
        </p>
        <ButtonLink to="/shop" size="sm" className={styles.explore} data-testid="home-explore-more">
          Explore More
        </ButtonLink>
      </div>

      <div
        className={styles.carousel}
        role="region"
        aria-roledescription="carousel"
        aria-label="Room inspirations"
      >
        {inspirations.isPending ? (
          <div className={styles.loading}>
            <Skeleton height={582} rounded />
            <Skeleton height={486} rounded />
          </div>
        ) : inspirations.isError ? (
          <ErrorState
            compact
            message="We could not load the room inspirations."
            onRetry={() => void inspirations.refetch()}
            data-testid="home-inspirations-error"
          />
        ) : (
          <>
            <div className={styles.viewport} ref={emblaRef}>
              <div className={styles.track}>
                {slides.map((slide, index) => {
                  const isActive = index === selected;
                  return (
                    <div
                      key={slide.id}
                      className={cn(styles.slide, isActive && styles.active)}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
                      data-testid={`inspiration-slide-${slide.id}`}
                      data-active={isActive}
                    >
                      <img
                        src={slide.image_url}
                        srcSet={mediaSrcSet(slide.image_url)}
                        sizes="(min-width: 1024px) 404px, 80vw"
                        alt=""
                        loading="lazy"
                        className={styles.image}
                      />
                      {isActive && (
                        <div className={styles.info}>
                          <div className={styles.infoText}>
                            <p className={styles.room}>
                              {slide.index} <span aria-hidden="true">—</span> {slide.room}
                            </p>
                            <p className={styles.slideTitle}>{slide.title}</p>
                          </div>
                          <Link
                            to={slide.link}
                            className={styles.go}
                            aria-label={`Shop the ${slide.title} look`}
                            data-testid={`inspiration-link-${slide.id}`}
                          >
                            <ArrowRight size={24} />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className={cn(styles.arrow, styles.prev)}
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous inspiration"
              data-testid="inspiration-prev"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              className={cn(styles.arrow, styles.next)}
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next inspiration"
              data-testid="inspiration-next"
            >
              <ChevronRight size={24} />
            </button>

            <div className={styles.dots}>
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={cn(styles.dot, index === selected && styles.dotActive)}
                  onClick={() => emblaApi?.scrollTo(index)}
                  aria-label={`Show inspiration ${index + 1}`}
                  aria-current={index === selected ? 'true' : undefined}
                  data-testid={`inspiration-dot-${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
