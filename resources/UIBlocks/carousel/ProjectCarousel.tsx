// ProjectCarousel.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ImageButton from "../../components/button/ImageBtn";

type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  link: string;
};

type Props = {
  products: Product[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  numVisible?: number; // number of cards visible at once
};

const ProjectCarousel: React.FC<Props> = ({
  products,
  autoSlide = false,
  autoSlideInterval = 5000,
  numVisible = 3, // default: 3 cards visible on desktop
}) => {
  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));
    return ["all", ...uniqueCategories];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const [numVisible1,setNumVisible]=useState(numVisible);
  
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 540) setNumVisible(1);
      else if (window.innerWidth > 540 && window.innerWidth < 1024)
        setNumVisible(2);
      else setNumVisible(3);
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const [currentIndex, setCurrentIndex] = useState(0);


  // touch refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = () => {
    if (currentIndex < filteredProducts.length - numVisible) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(Math.max(filteredProducts.length - numVisible, 0));
    }
  };

  // Auto-slide
  useEffect(() => {
    if (!autoSlide) return;
    const interval = setInterval(nextSlide, autoSlideInterval);
    return () => clearInterval(interval);
  }, [currentIndex, autoSlide, autoSlideInterval, filteredProducts.length]);

  // Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) nextSlide();
    if (touchEndX.current - touchStartX.current > 50) prevSlide();
  };

  const [filerref1, inView1] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  return (
    <div className="relative w-full p-6">
      {/* Category Filter */}
      <div ref={filerref1} className="flex gap-3 mb-6 justify-center flex-wrap">
        {categories.map((cat, index) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setCurrentIndex(0); // reset slider when filter changes
            }}
            className={`px-4 py-1 rounded-full text-sm font-medium shadow-md transition cursor-pointer animate__animated ${
              inView1 ? "animate__fadeInRight" : "opacity-0"
            } ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-primary/10"
            }`}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Slider Wrapper */}
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${currentIndex * (100 / numVisible1)}%)`,
          }}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="py-7 px-2 flex-shrink-0"
              style={{ width: `${100 / numVisible1}%` }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-background rounded-md shadow-lg overflow-hidden cursor-pointer border border-ring/30 transition hover:-translate-y-2 duration-300 h-full flex flex-col"
                onClick={() => window.open(product.link, "_blank")}
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full max-h-[60vh] object-fit"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  <p className="text-sm text-foreground flex-1">{product.description}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="hidden md:block">
        <ImageButton
          icon="left"
          onClick={prevSlide}
          className="absolute -left-3 top-1/2 -translate-y-1/2 bg-primary/30 text-foreground p-2"
        />
        <ImageButton
          icon="right"
          onClick={nextSlide}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-primary/30 text-foreground p-2"
        />
      </div>
    </div>
  );
};

export default ProjectCarousel;
