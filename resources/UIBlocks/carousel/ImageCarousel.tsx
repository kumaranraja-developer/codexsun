import { useEffect, useRef, useState } from "react";
import ImageButton from "../../components/button/ImageBtn";

export interface ScrollAdverthismentItem {
  id: string;
  image: string;
}

interface ImageCarouselProps {
  images: ScrollAdverthismentItem[];
  interval?: number; // auto-slide interval (ms), optional
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  interval = 3000,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isOverflowing = el.scrollWidth > el.clientWidth;
    const atStart = el.scrollLeft <= 10;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
    setShowLeft(isOverflowing && !atStart);
    setShowRight(isOverflowing && !atEnd);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollButtons();
    el.addEventListener("scroll", checkScrollButtons);
    window.addEventListener("resize", checkScrollButtons);
    return () => {
      el.removeEventListener("scroll", checkScrollButtons);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [images]);

  const goToSlide = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = window.innerWidth * index;
    el.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  const scroll = (direction: "left" | "right") => {
    let newIndex =
      direction === "left"
        ? (currentIndex - 1 + images.length) % images.length
        : (currentIndex + 1) % images.length;
    goToSlide(newIndex);
  };

  // Auto play
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      goToSlide(nextIndex);
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, interval, images.length]);

  return (
    <div className="relative max-w-full overflow-hidden">
      {/* Left Button */}
      {showLeft && (
        <ImageButton
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-200"
          icon={"left"}
        >
          <span className="sr-only">previous slide</span>
        </ImageButton>
      )}

      {/* Right Button */}
      {showRight && (
        <ImageButton
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-200"
          icon={"right"}
        >
          <span className="sr-only">previous slide</span>
        </ImageButton>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory"
      >
        <div className="flex min-w-max">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group w-screen h-[90vh] cursor-pointer flex-shrink-0 snap-start"
            >
              <img
                src={image.image}
                alt={image.id}
                className="w-full h-full object-cover"
              />
              {/* Optional index indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i === currentIndex ? "bg-primary" : "bg-background"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
