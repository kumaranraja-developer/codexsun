import { useState, useEffect, useRef } from "react";
import ImageButton from "../../components/button/ImageBtn";
import { Heading } from "lucide-react";

type Testimonial = {
  id: number;
  company: string;
  logo: string;
  feedback: string;
  client: string;
};

type TestimonialCarouselProps = {
  testimonials: Testimonial[];
  autoSlide?: boolean; // enable/disable auto-slide
  autoSlideInterval?: number; // interval in ms
  heading: string;
};

export default function TestimonialCarousel({
  testimonials,
  autoSlide = false,
  autoSlideInterval = 6000, // default: 3s
  heading,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [numVisible] = useState(1);

  // keep touch values in refs so they persist
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = () => {
    if (currentIndex < testimonials.length - numVisible) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // loop back to start
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      // loop to last
      setCurrentIndex(testimonials.length - numVisible);
    }
  };

  // Auto-slide effect
  useEffect(() => {
    if (!autoSlide) return;
    const interval = setInterval(() => {
      nextSlide();
    }, autoSlideInterval);
    return () => clearInterval(interval);
  }, [currentIndex, autoSlide, autoSlideInterval]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide(); // swipe left
    }
    if (touchEndX.current - touchStartX.current > 50) {
      prevSlide(); // swipe right
    }
  };

  return (
    <div className="w-full md:w-[60%] mx-auto relative">
      <h1 className="text-2xl md:text-4xl text-center font-bold pb-10">
        {heading}
      </h1>

      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${currentIndex * (100 / numVisible)}%)`,
          }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-4 flex-shrink-0"
              style={{ width: `${100 / numVisible}%` }}
            >
              <div className="bg-background rounded-xl border border-ring/30 shadow-lg p-6 h-full flex flex-col gap-5 justify-between min-h-[280px]">
                {/* Logo + Company */}
                <img
                  src={t.logo}
                  alt={t.company}
                  className="w-36 h-36 object-cover rounded-full block mx-auto"
                />
                <div>
                  <h4 className="font-semibold text-lg text-center">
                    {t.company}
                  </h4>

                  {/* Feedback */}
                  <p className="text-gray-600 italic mb-4 text-center">
                    “{t.feedback}”
                  </p>

                  {/* Client */}
                  <p className="text-sm font-medium text-gray-800 text-center">
                    {t.client}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end pr-4">
        {/* Controls (hidden on mobile) */}
        <div className="flex gap-2 flex-nowrap">
          <ImageButton
            icon="left"
            onClick={prevSlide}
            className=" bg-primary/30 text-foreground p-2"
          />
          <ImageButton
            icon="right"
            onClick={nextSlide}
            className="bg-primary/30 text-foreground p-2"
          />
        </div>
      </div>
    </div>
  );
}
