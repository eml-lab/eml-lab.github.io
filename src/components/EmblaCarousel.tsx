import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import AutoScroll from "embla-carousel-auto-scroll";
import FeaturedCard from "./FeaturedCard";

interface FeaturedItem {
  category: string;
  title: string;
  description: string;
  image: string;
  primaryText: string;
  primaryLink: string;
  secondaryText?: string;
  secondaryLink?: string;
}

interface Props {
  items: FeaturedItem[];
}

export default function EmblaCarousel({ items }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const autoScrollTimeout = useRef<number | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
    },
    [
      WheelGesturesPlugin({
        forceWheelAxis: "x",
      }),
      AutoScroll({
        playOnInit: true,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
        speed: 1.3,
        startDelay: 100,
      }),
    ]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const pauseAutoScroll = useCallback((delay = 250) => {
    const autoScroll = emblaApi?.plugins()?.autoScroll;

    if (!autoScroll) return;

    autoScroll.stop();

    if (autoScrollTimeout.current !== null) {
        window.clearTimeout(autoScrollTimeout.current);
    }

    autoScrollTimeout.current = window.setTimeout(() => {
        autoScroll.play();
        autoScrollTimeout.current = null;
    }, delay);
    }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    pauseAutoScroll(5000);
    emblaApi?.scrollTo(index);
    }, [emblaApi, pauseAutoScroll]);

    const scrollPrev = useCallback(() => {
        pauseAutoScroll(5000);
        emblaApi?.scrollPrev();
    }, [emblaApi, pauseAutoScroll]);

    const scrollNext = useCallback(() => {
        pauseAutoScroll(5000);
        emblaApi?.scrollNext();
    }, [emblaApi, pauseAutoScroll]);

  return (
    <section className="featured-carousel">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {items.map((item) => (
            <div className="embla__slide" key={item.title}>
              <FeaturedCard {...item} />
            </div>
          ))}
        </div>
      </div>

      <div className="featured-carousel-controls">
        <div className="featured-carousel-arrows">
          <button
            className="carousel-arrow"
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            ←
          </button>

          <button
            className="carousel-arrow"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            →
          </button>
        </div>

        <div className="featured-carousel-dots">
          {items.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${
                index === selectedIndex ? "active" : ""
              }`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}