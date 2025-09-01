import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../components/button/Button";
import ImageButton from "../../components/button/ImageBtn";

type Section = {
  image: string;
  title: string;
  description: string;
  buttonLabel?: string;
};

type HighlightedBannerProps = {
  sections: Section[];
};

const HighlightedBanner: React.FC<HighlightedBannerProps> = ({ sections }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  /** Track resize → mobile/desktop */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** Desktop hover effect */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - left;
    const sliceWidth = width / sections.length;
    setActiveIndex(Math.floor(relativeX / sliceWidth));
  };
  const handleMouseLeave = () => setActiveIndex(null);

  /** Mobile slider controls */
  const nextSlide = () =>
    setCurrentIndex((prev) => (prev < sections.length - 1 ? prev + 1 : 0));
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sections.length - 1));

  // swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) =>
    (touchStartX.current = e.changedTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) =>
    (touchEndX.current = e.changedTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) nextSlide();
    if (touchEndX.current - touchStartX.current > 50) prevSlide();
  };

  return (
    <div className="w-full">
      {/* ---------------- MOBILE (Slider) ---------------- */}
      {isMobile ? (
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            transition={{ ease: "easeInOut", duration: 0.6 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {sections.map((section, idx) => (
              <div key={idx} className="w-full flex-shrink-0 relative h-[65vh]">
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white text-center px-6">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-2 drop-shadow-md"
                  >
                    {section.title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-3 text-sm md:text-base"
                  >
                    {section.description}
                  </motion.p>
                  {section.buttonLabel && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        label={section.buttonLabel}
                        className="bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Controls */}
          <ImageButton
            icon="left"
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary/40 hover:bg-primary/60 text-white p-2 rounded-full shadow-lg"
          />
          <ImageButton
            icon="right"
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/40 hover:bg-primary/60 text-white p-2 rounded-full shadow-lg"
          />

          {/* Pagination dots */}
          <div className="absolute bottom-4 w-full flex justify-center gap-2">
            {sections.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  idx === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* ---------------- DESKTOP (Hover Expand) ---------------- */
        <div
          ref={containerRef}
          className="w-full h-[75vh] rounded-3xl overflow-hidden flex relative shadow-2xl"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {sections.map((section, idx) => {
            const sliceWidthPercent = 100 / sections.length; // original 20% if 5 items

            return (
              <motion.div
                key={idx}
                animate={{
                  flex:
                    activeIndex === null ? 1 : activeIndex === idx ? 5 : 0.8,
                }}
                transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                className="relative overflow-hidden cursor-pointer"
              >
                <motion.img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-full object-cover"
                  animate={{ scale: activeIndex === idx ? 1.1 : 1 }}
                  transition={{ duration: 1.2 }}
                />

                {/* Default Title */}
                <motion.div
                  animate={{
                    opacity: activeIndex === idx ? 0 : 1,
                    y: activeIndex === idx ? 20 : 0,
                  }}
                  className="absolute inset-0 flex items-center justify-center text-white text-center p-4"
                >
                  <h2 className="text-lg md:text-xl font-bold drop-shadow">
                    {section.title}
                  </h2>
                </motion.div>

                {/* Button only visible on hover, stays in original slice center */}
                {/* {section.buttonLabel && activeIndex === idx && (
                  <div
                    className="absolute bottom-4 left-0 z-100"
                    style={{
                      width: `${sliceWidthPercent}%`,
                      left: `${sliceWidthPercent * idx + sliceWidthPercent / 2}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <Button
                      label={section.buttonLabel}
                      className="w-max bg-primary  text-primary-foreground shadow-lg hover:scale-105 transition-transform"
                    />
                  </div>
                )} */}

                {/* Active Overlay */}
                <AnimatePresence>
                  {activeIndex === idx && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-6 z-20"
                    >
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-4xl font-bold mb-3"
                      >
                        {section.title}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-2xl mb-4"
                      >
                        {section.description}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HighlightedBanner;
