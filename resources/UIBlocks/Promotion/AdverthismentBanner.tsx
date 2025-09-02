import React, { useState, useEffect, useRef } from "react";
import apiClient from "../../../resources/global/api/apiClients";
import { useAppContext } from "../../../resources/global/AppContaxt";
import "animate.css";

interface SlideContent {
  id: string;
  image: string;
}

interface AdverthismentBannerProps {
  api: string;
  autoPlay?: boolean;
  delay?: number;
}

const AdverthismentBanner: React.FC<AdverthismentBannerProps> = ({
  api,
  autoPlay = true,
  delay = 6000,
}) => {
  const { API_URL } = useAppContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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

    // Step 1: Filter out nulls and only take those with current_slider true
    const validItems = detailResponses.filter(
      (item) => item && item.current_slider
    );

    // Step 2: Flatten all sliders_tbl entries into slides[]
    const formatted: SlideContent[] = validItems.flatMap((item: any) =>
      (item.sliders_tbl || []).map((slider: any) => ({
        id: String(slider.name), // always string
        image: `${API_URL}${slider.slider_image}`, // full URL
      }))
    );

    setSlides(formatted);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
};


  useEffect(() => {
    fetchProducts();
  }, []);

  const changeSlide = (newIndex: number) => {
    setPrevIndex(activeIndex); // Track exiting slide
    setActiveIndex(newIndex);
    setTimeout(() => setPrevIndex(null), 500); // Clear after animation (500ms = Animate.css default)
  };

  const goToNext = () => {
    changeSlide((activeIndex + 1) % slides.length);
  };

  useEffect(() => {
    if (!autoPlay || slides.length === 0) return;
    const interval = setInterval(goToNext, delay);
    return () => clearInterval(interval);
  }, [slides.length, autoPlay, delay, activeIndex]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) goToNext();
    else if (distance < -50)
      changeSlide(activeIndex === 0 ? slides.length - 1 : activeIndex - 1);
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="relative w-full h-[250px] md:h-[400px] bg-background overflow-hidden">
      <div
        className="w-full h-full relative flex"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          const isPrev = index === prevIndex;

          return (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full flex border-y border-ring/30
                ${isActive ? "block animate__animated animate__fadeInDown animate__fast" : ""}
                ${isPrev ? "block animate__animated animate__fadeOutDown animate__faster" : ""}
                ${!isActive && !isPrev ? "hidden" : ""}`}
            >
              <div className="w-full h-[250px] md:h-[400px] flex items-center justify-center">
                <img
                  src={`${slide.image}`}
                  alt={slide.id}
                  className="h-full w-full object-fill"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => changeSlide(index)}
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

export default AdverthismentBanner;
