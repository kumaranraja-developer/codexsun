// HeroCarousel.tsx
import React from "react";
import { motion } from "framer-motion";
import Carousel from "../../../resources/components/Carousel";

export type Slide = {
  id: string | number;
  bgClass?: string;
  title1: string;
  title2?: string;
  description: string;
  image: string;
  backdrop?: string;
  backdropposition?: string;
};

export type HeroCarouselProps = {
  slides: Slide[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
};

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  autoSlide = true,
  autoSlideInterval = 7000,
}) => {
  // Motion variants
  const textVariant = (delay: number) => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay } },
  });

  const imageVariant = (delay: number) => ({
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay } },
  });

  return (
    <Carousel autoSlide={autoSlide} autoSlideInterval={autoSlideInterval}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`lg:px-[12%] h-[90vh] mt-20 md:mt-0 md:h-[100vh] overflow-hidden relative ${slide.bgClass}`}
        >
          {/* Background */}
          {slide.backdrop && (
            <img
              src={slide.backdrop}
              alt={slide.title1}
              className={`absolute w-full h-full z-0 blur-[3px] object-contain ${slide.backdropposition}`}
            />
          )}

          {/* Content Wrapper */}
          <div
            className={`flex gap-10 z-10 items-center text-foreground justify-center h-full ${
              index % 2 === 0
                ? "flex-col md:flex-row"
                : "flex-col-reverse md:flex-row-reverse"
            } w-full ${slide.bgClass}`}
          >
            {/* Text Section */}
            <div
              className={`w-full md:w-[50%] p-5 z-10 flex flex-col md:px-5 justify-center items-center md:items-start ${
                index % 2 === 0 ? "" : "lg:pl-20"
              } gap-4 md:gap-8`}
            >
              <motion.div initial="hidden" whileInView="visible">
                <motion.h1
                  variants={textVariant(0.2)}
                  className="text-2xl lg:text-4xl xl:text-5xl font-bold text-center md:text-start"
                >
                  {slide.title1}
                </motion.h1>
                {slide.title2 && (
                  <motion.h1
                    variants={textVariant(0.4)}
                    className="text-lg md:text-2xl lg:text-4xl xl:text-5xl font-bold text-center mt-2 md:text-start"
                  >
                    {slide.title2}
                  </motion.h1>
                )}
              </motion.div>
              <motion.p
                variants={textVariant(0.6)}
                initial="hidden"
                whileInView="visible"
                className="text-md text-center md:text-left px-5 md:px-0 leading-tight md:leading-snug max-w-xl"
              >
                {slide.description}
              </motion.p>
            </div>

            {/* Image Section */}
            <motion.div
              className="w-[80%] z-1 flex justify-center"
              variants={imageVariant(0.8)}
              initial="hidden"
              whileInView="visible"
            >
              <img
                src={slide.image}
                alt="Hero Slide"
                className="block w-[80%]  p-5 object-contain"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      ))}
    </Carousel>
  );
};

export default HeroCarousel;
