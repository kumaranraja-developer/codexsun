import React, { useState, useEffect, useRef } from "react";
import apiClient from "../../../resources/global/api/apiClients";
import { useAppContext } from "../../../apps/global/AppContaxt";
import Button from "../../../resources/components/button/Button";
import { useNavigate } from "react-router-dom";

interface SlideContent {
  id: string;
  image: string;
  bg_image: string;
  title: string;
  description?: string;
  actual_price?: number;
  offer_price?: number;
  slogan?: string;
  discount?: string;
  layout?: string;
  theme: string;
  link: string;
  save: string;
  slider_base: string;
}

interface CustomBannerCarouselProps {
  api: string;
  autoPlay?: boolean;
  delay?: number; // milliseconds
  sliderBase: string;
}

const CustomBannerCarousel: React.FC<CustomBannerCarouselProps> = ({
  api,
  autoPlay = true,
  delay = 6000,
  sliderBase,
}) => {
  const { API_URL } = useAppContext();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  //  Add swipe handler functions:
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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
  const fetchProducts = async () => {
    try {
      const response = await apiClient.get(`${api}`);
      const items = response.data.data || [];
      const baseApi = api.split("?")[0];

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

      // ✅ Only keep items where slider_base matches the prop
      const filteredItems = validItems.filter(
        (item: any) => item.slider_base === sliderBase
      );

      const formatted: SlideContent[] = filteredItems.map((item: any) => {
        return {
          id: item.name,
          title: item.title,
          image: `${API_URL}/${item.product_image}`,
          bg_image: `${API_URL}/${item.background}`,
          description: item.describtion,
          discount: item.stock_qty,
          actual_price: item.actual_price,
          offer_price: item.offer_price,
          slogan: item.slogan,
          layout: item.layout,
          theme: item.theme,
          link: item.product_link,
          save: item.percentage,
          slider_base: item.slider_base,
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
    setActiveIndex(index);
    startTimeRef.current = null;
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

  const handleShop = ({ link }: { link: string }) => {
    navigate(`/productpage/${link}`);
  };
  return (
    <div className="relative w-full h-[380px] md:h-[350px] bg-background overflow-hidden">
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
            className="w-full h-full flex border-y border-ring/30 flex-shrink-0"
          >
            {slide.layout === "Layout - 1" ? (
              <div
                className={`w-full h-[380px] md:h-[350px] flex items-center justify-center relative ${slide.theme === "dark" ? "text-black" : "text-white"}`}
              >
                {/* Background Image */}
                <img
                  src={slide.bg_image}
                  alt={`Slide ${index}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute left-5 sm:left-25 lg:left-60 flex flex-col gap-3 right-1/2 pr-2 top-1/2 -translate-y-1/2 text-white">
                  {slide.title && (
                    <p className="text-lg sm:text-2xl md:text-2xl lg:text-4xl font-bold  line-clamp-2">
                      {slide.title}
                    </p>
                  )}

                  {slide.description && (
                    <p className="mt-2 text-xs sm:text-sm md:text-lg lg:text-lg line-clamp-2">
                      {slide.description}
                    </p>
                  )}

                  {slide.actual_price && (
                    <p className="mt-2 text-xl lg:text-3xl font-bold text-right">
                      <span
                        className={`line-through text-sm lg:text-lg ${slide.theme === "dark" ? "text-black/70" : "text-white/70"}`}
                      >
                        ₹ {slide.actual_price}
                      </span>{" "}
                      ₹ {slide.offer_price}
                      <br />
                      <span
                        className={`text-sm ${slide.theme === "dark" ? "text-black/70" : "text-white/70"}`}
                      >
                        {slide.save}
                      </span>
                    </p>
                  )}

                  <Button
                    label="Shop Now"
                    className="bg-primary w-max text-white hover:bg-hover"
                    onClick={() => {
                      handleShop({ link: slide.link });
                    }}
                  />
                </div>

                {/* Foreground Product Image */}
                <img
                  src={slide.image}
                  alt={`Slide ${index} product`}
                  className="absolute right-1 sm:right-1/18 md:right-1/15 lg:right-1/8 top-1/2 -translate-y-1/2 max-h-[40%] sm:max-h-[60%] md;max-h-[80%] lg:max-h-[100%] object-scale-down"
                />

                {/* Centered Blockquote at Bottom */}
                {slide.slogan && (
                  <blockquote className="absolute bottom-8 left-1/2 w-full -translate-x-1/2 italic text-sm md:text-lg lg:text-xl font-bold text-center px-2">
                    {slide.slogan}
                  </blockquote>
                )}
              </div>
            ) : slide.layout === "Layout - 2" ? (
              <div
                className={`w-full h-[380px] md:h-[350px] flex items-center justify-center relative ${slide.theme === "dark" ? "text-black" : "text-white"}`}
              >
                {/* Background Image */}
                <img
                  src={slide.bg_image}
                  alt={`Slide ${index}`}
                  className="h-full w-full object-fit lg:object-cover"
                />

                {/* Bottom Content Section with dimmed background */}
                <div className="absolute bottom-0 left-0 w-full bg-black/60 px-[10%] py-4 flex flex-row gap-6 items-center text-white">
                  {/* Left Column */}
                  <div className="flex-1">
                    {slide.title && (
                      <p className="text-lg sm:text-2xl font-bold  line-clamp-2">
                        {slide.title}
                      </p>
                    )}

                    {slide.description && (
                      <p className="mt-2 text-xs sm:text-sm md:text-md line-clamp-2">
                        {slide.description}
                      </p>
                    )}

                    {slide.actual_price && (
                      <p className="mt-2 text-xl font-bold">
                        <span
                          className={`line-through text-lg ${slide.theme === "dark" ? "text-black/70" : "text-white/70"}`}
                        >
                          ₹ {slide.actual_price}
                        </span>{" "}
                        ₹ {slide.offer_price}
                      </p>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="flex-1">
                    {slide.slogan && (
                      <blockquote className="italic text-sm md:text-lg lg:text-xl font-bold text-right">
                        {slide.slogan}
                      </blockquote>
                    )}
                  </div>
                </div>
              </div>
            ) : slide.layout === "Layout - 3" ? (
              <div
                className={`w-full h-[380px] md:h-[350px] flex items-center justify-center relative ${slide.theme === "dark" ? "text-black" : "text-white"}`}
              >
                {/* Background Image */}
                <img
                  src={slide.bg_image}
                  alt={`Slide ${index}`}
                  className="h-full w-full object-cover"
                />

                {/* Overlay Dark Layer */}
                <div className="absolute inset-0 bg-black/10"></div>
                {/* Foreground Image */}

                <img
                  src={slide.image}
                  alt={`Slide ${index} product`}
                  className="absolute left-5 sm:left-1/6 lg:left-1/5 top-1/2 -translate-y-1/2 h-[40%] sm:h-[60%] md:h-[70%] lg:h-[100%] object-contain"
                />

                <div className="absolute lg:right-40 flex flex-col gap-3 left-1/2 pr-2 top-1/2 -translate-y-1/2">
                  {slide.title && (
                    <p className="text-lg sm:text-2xl md:text-2xl lg:text-4xl font-bold  line-clamp-2">
                      {slide.title}
                    </p>
                  )}

                  {slide.description && (
                    <p className="mt-2 text-xs sm:text-sm md:text-lg lg:text-lg line-clamp-2">
                      {slide.description}
                    </p>
                  )}

                  {slide.actual_price && (
                    <p className="mt-2 text-xl font-bold">
                      <span
                        className={`line-through text-lg ${slide.theme === "dark" ? "text-black/70" : "text-white/70"}`}
                      >
                        ₹ {slide.actual_price}
                      </span>{" "}
                      ₹ {slide.offer_price}
                    </p>
                  )}

                  {slide.slogan && (
                    <blockquote className="mt-4 italic text-sm md:text-lg lg:text-xl font-bold">
                      {slide.slogan}
                    </blockquote>
                  )}

                  <Button
                    label="Shop Now"
                    className="bg-primary w-max text-white hover:bg-hover"
                    onClick={() => {
                      handleShop({ link: slide.link });
                    }}
                  />
                </div>
              </div>
            ) : slide.layout === "Layout - 4" ? (
              <div
                className={`w-full h-[380px] md:h-[350px] flex items-center justify-center relative ${slide.theme === "dark" ? "text-black" : "text-white"}`}
              >
                {/* Background Image */}
                <img
                  src={slide.bg_image}
                  alt={`Slide ${index}`}
                  className="h-full w-full object-cover"
                />

                {/* Overlay Dark Layer */}
                <div className="absolute inset-0 bg-black/10"></div>

                {/* Left Side Content */}
                <div className="absolute left-10 sm:left-25 lg:left-60 flex flex-col gap-3 right-1/2 pr-2 top-1/2 -translate-y-1/2">
                  {slide.title && (
                    <p className="text-lg sm:text-2xl md:text-2xl lg:text-4xl font-bold line-clamp-2">
                      {slide.title}
                    </p>
                  )}

                  {slide.description && (
                    <p className="mt-5 text-xs sm:text-sm md:text-lg lg:text-lg line-clamp-2">
                      {slide.description}
                    </p>
                  )}

                  {slide.actual_price && (
                    <p className="mt-2 text-xl lg:text-5xl font-bold">
                      <span
                        className={`line-through text-lg ${slide.theme === "dark" ? "text-black/70" : "text-white/70"}`}
                      >
                        ₹ {slide.actual_price}
                      </span>{" "}
                      ₹ {slide.offer_price}
                    </p>
                  )}

                  <Button
                    label="Shop Now"
                    className="bg-primary w-max text-white hover:bg-hover"
                    onClick={() => {
                      handleShop({ link: slide.link });
                    }}
                  />
                </div>

                {/* Foreground Product Image */}
                <img
                  src={slide.image}
                  alt={`Slide ${index} product`}
                  className="absolute right-3 sm:right-1/18 md:right-1/15 lg:right-1/8 top-1/2 -translate-y-1/2 h-[50%] sm:h-[70%] md:h-[80%] lg:h-[100%] object-scale-down"
                />

                {/* Centered Blockquote at Bottom */}
                {slide.slogan && (
                  <blockquote className="absolute bottom-8 left-1/2 -translate-x-1/2 italic text-sm md:text-lg lg:text-xl font-bold text-center">
                    {slide.slogan}
                  </blockquote>
                )}
              </div>
            ) : (
              <div
                className={`w-full h-[380px] md:h-[350px] flex items-center justify-center relative ${slide.theme === "dark" ? "text-black" : "text-white"}`}
              >
                {/* Background Image */}
                <img
                  src={slide.bg_image}
                  alt={`Slide ${index}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>

                {/* Foreground Product Image - positioned inside relative container */}
                <img
                  src={slide.image}
                  alt={`Slide ${index} product`}
                  className="absolute left-5 sm:left-1/6 lg:left-1/5 top-1/2 -translate-y-1/2 h-[30%] sm:h-[60%] md:h-[70%] lg:h-[90%] object-contain"
                />
                {/* Optional Right Side Content */}
                <div className="absolute lg:right-40 flex flex-col gap-3 left-1/2 pr-2 top-1/2 -translate-y-1/2">
                  {slide.title && (
                    <p className="text-lg sm:text-2xl md:text-2xl lg:text-4xl font-bold text-center  line-clamp-2">
                      {slide.title}
                    </p>
                  )}

                  {slide.description && (
                    <p className="mt-2 text-xs sm:text-sm md:text-lg lg:text-lg text-center  line-clamp-2">
                      {slide.description}
                    </p>
                  )}

                  {slide.actual_price && (
                    <p className="mt-2 text-xl md:text-4xl font-bold text-center">
                      <span
                        className={`line-through text-lg ${slide.theme === "dark" ? "text-black/70" : "text-white/70"}`}
                      >
                        ₹ {slide.actual_price}
                      </span>{" "}
                      ₹ {slide.offer_price}
                    </p>
                  )}

                  {slide.slogan && (
                    <blockquote className="mt-4 italic text-sm md:text-lg lg:text-xl font-bold text-center">
                      {slide.slogan}
                    </blockquote>
                  )}

                  <Button
                    label="Shop Now"
                    className="bg-primary w-max block mx-auto text-white hover:bg-hover"
                    onClick={() => {
                      handleShop({ link: slide.link });
                    }}
                  />
                </div>
              </div>
            )}
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
    </div>
  );
};

export default CustomBannerCarousel;
