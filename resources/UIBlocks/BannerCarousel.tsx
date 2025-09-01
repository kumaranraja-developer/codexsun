import BallCanvas from "../AnimationComponents/BallAnimation";
import ImageButton from "../components/button/ImageBtn";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../resources/global/api/apiClients";
import { useAppContext } from "../../apps/global/AppContaxt";

interface SlideContent {
  id: string;
  image: string;
  title: string;
  description: string;
  price: number;
  discount?: string;
}

interface BannerCarouselProps {
  api: string;
  autoPlay?: boolean;
  delay?: number; // milliseconds
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  api,
  autoPlay = true,
  delay = 6000,
}) => {
  const { API_URL } = useAppContext();

  const [activeIndex, setActiveIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(delay / 1000);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Add swipe handler functions
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    if (distance > threshold) {
      // Swiped left
      goToSlide((activeIndex + 1) % slides.length);
    } else if (distance < -threshold) {
      // Swiped right
      goToSlide(activeIndex === 0 ? slides.length - 1 : activeIndex - 1);
    }

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const [slides, setSlides] = useState<SlideContent[]>([]);
  const navigate = useNavigate();
  const fetchProducts = async () => {
    try {
      // Step 1: Fetch all item names
      const response = await apiClient.get(`${api}`);

      const items = response.data.data || [];
      const baseApi = api.split("?")[0];

      // Step 2: Fetch full details for each item
      const detailPromises = items.map((item: any) => {
        const itemName = encodeURIComponent(item.name);
        const detailUrl = `${baseApi}/${itemName}`;
        return apiClient
          .get(detailUrl)
          .then((res) => res.data.data)
          .catch((err) => {
            console.warn(`Item not found: ${item.name}`, err);
            return null;
          });
      });

      const detailResponses = await Promise.all(detailPromises);
      const validItems = detailResponses.filter(Boolean);

      const formatted: SlideContent[] = validItems.map((item: any) => {
        return {
          id: item.name,
          title: item.name, // or item.item_name if you want full name
          image: `${item.image_1}`,
          description: item.slider_highlighter,
          discount: item.slider_offer,
          price: item.price || item.standard_rate || 0,
        };
      });

      setSlides(formatted);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const goToSlide = (index: number) => {
    if (isAnimating || index === activeIndex) return; // Prevent spam
    setIsAnimating(true);
    setPrevIndex(activeIndex);
    setTimeout(() => {
      setActiveIndex(index);
      setPrevIndex(null);
      setIsAnimating(false);
    }, 100); // match animation duration
  };

  const goToNext = () => {
    goToSlide((activeIndex + 1) % slides.length);
  };

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / delay, 3);
    const remaining = Math.max((delay - elapsed) / 1000, 0);
    setRemainingTime(remaining);

    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      goToNext();
    }
  };

  useEffect(() => {
    if (!autoPlay || slides.length === 0) return;

    let animationFrameId: number;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const remaining = Math.max((delay - elapsed) / 1000, 0);

      setRemainingTime(remaining);

      if (elapsed < delay) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        goToNext();
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      startTime = null;
    };
  }, [activeIndex, slides.length, autoPlay, delay]);

  const progressPercent = (1 - remainingTime / (delay / 1000)) * 100;
  const strokeDashoffset =
    circumference - (progressPercent / 100) * circumference;

  const navigateProductPage = (id: string) => {
    navigate(`/productpage/${id}`);
  };
  return (
    <div className="relative w-full h-[350px] lg:h-[600px] bg-background overflow-hidden">
      <div className="absolute ">
        <BallCanvas ballCount={7} />
      </div>

      {/* 🔹 Slides */}
      <div
        className="w-full h-full relative flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="w-full h-full flex border-y border-ring/30 px-6 py-4 flex-shrink-0"
          >
            {/* Left: Image */}
            <div className="w-1/2 h-full flex items-center justify-center">
              <img
                src={`${API_URL}/${slide.image}`}
                alt={`Slide ${index}`}
                className="h-full w-full md:p-3 object-contain"
              />
            </div>

            {/* Right: Text Content */}
            <div className="w-1/2 h-full flex flex-col justify-center items-start p-4 relative">
              <h2 className="text-sm sm:text-lg md:text-3xl lg:text-5xl font-bold line-clamp-2 uppercase mb-2">
                {slide.title}
              </h2>

              {slide.description && (
                <h2 className="text-sm sm:text-md md:text-lg line-clamp-2 my-2">
                  {slide.description}
                </h2>
              )}

              {slide.price && (
                <p className="text-sm sm:text-md md:text-2xl font-semibold mt-3">
                  Just ₹ {slide.price}
                </p>
              )}

              {slide.discount && (
                <p className="text-md md:text-2xl mt-3">
                  {slide.discount} % Offer
                </p>
              )}
              
              <button
                className="mt-4 px-4 md:px-7 py-2 md:py-3 bg-primary hover:bg-hover text-white text-md md:text-2xl whitespace-nowrap rounded-sm"
                onClick={() => navigateProductPage(slide.id)}
              >
                Shop Now
              </button>

              {/* Timer */}
              <div className="absolute bottom-4 right-4">
                <svg width="50" height="50" className="text-black">
                  <circle
                    cx="25"
                    cy="25"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="25"
                    cy="25"
                    r={radius}
                    stroke="#3b82f6"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.05s linear" }}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="12"
                    fill="currentColor"
                    fontWeight="bold"
                  >
                    {Math.ceil(remainingTime)}s
                  </text>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === activeIndex
                ? "bg-primary"
                : "bg-white border border-ring/50"
            }`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <ImageButton
        onClick={() =>
          goToSlide(activeIndex === 0 ? slides.length - 1 : activeIndex - 1)
        }
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/30 text-white p-2 sm:p-4 !rounded-full hover:bg-black/50 z-20 hidden md:block"
        icon={"left"}
      />
      <ImageButton
        onClick={() => goToSlide((activeIndex + 1) % slides.length)}
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/30 text-white p-2 sm:p-4 !rounded-full hover:bg-black/50 z-20 hidden md:block"
        icon={"right"}
      />
    </div>
  );
};

export default BannerCarousel;
