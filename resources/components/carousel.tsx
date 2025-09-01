import React, { useState, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import ImageButton from "./button/ImageBtn";

interface CarouselProps {
  children: ReactNode | ReactNode[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  startIndex?: number;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  autoSlide = false,
  autoSlideInterval = 3000,
  startIndex = 0,
}) => {
  const slides = React.Children.toArray(children);
  const [curr, setCurr] = useState(startIndex);

  const prev = () =>
    setCurr((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const next = () =>
    setCurr((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  // For swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;

    if (distance > 50) {
      // swipe left → next
      next();
    }

    if (distance < -50) {
      // swipe right → prev
      prev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    if (!autoSlide) return;

    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [autoSlide, autoSlideInterval]);

  return (
    <div
      className="overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {slides.map((child, i) => (
          <div key={i} className="flex-none w-full">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-50">
        <ImageButton
          aria-label="Previous slide"
          onClick={prev}
          icon="left"
          className="p-1 !rounded-full border border-ring/30 text-foreground hover:text-background hover:bg-hover cursor-pointer"
        >
          <span className="sr-only">previous slide</span>
        </ImageButton>
        <ImageButton
          aria-label="Next slide"
          onClick={next}
          icon="right"
          className="p-1 !rounded-full border border-ring/30 text-foreground hover:text-background hover:bg-hover cursor-pointer"
        >
          <span className="sr-only">previous slide</span>
        </ImageButton>
      </div>

      {/* Indicator bullets */}
      <div className="absolute bottom-5 right-0 left-0 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurr(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all w-3 h-3 rounded-full ${
              curr === i ? "bg-primary p-1" : "bg-primary/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
