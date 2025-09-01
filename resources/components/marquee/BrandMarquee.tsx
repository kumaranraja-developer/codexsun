import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

type Brand = {
  name: string;
  logo?: string;
};

interface BrandMarqueeProps {
  type: "logo" | "label" | "big-text";
  brands: Brand[];
  speed?: number; // pixels per second
  height: number;
  text?: string;
}

const BrandMarquee: React.FC<BrandMarqueeProps> = ({
  type,
  brands,
  speed = 100,
  height = 20,
  text,
}) => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [isHovering, setIsHovering] = useState(false);

  // Store current X position to resume from same place
  const xPosRef = useRef(0);

  // Duplicate many times to avoid flicker
  const marqueeItems = Array(50) // <-- 20 loops
    .fill(null)
    .flatMap(() => brands);

  useEffect(() => {
    if (!marqueeRef.current) return;

    let animationFrame: number;
    let lastTime = performance.now();
    let xPos = xPosRef.current;

    // Width of all items together
    const totalWidth = marqueeRef.current.scrollWidth;

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (!isHovering) {
        xPos -= speed * delta;

        // Wrap smoothly (never jump back to 0 abruptly)
        if (xPos <= -totalWidth / 2) {
          xPos += totalWidth / 2;
        }

        controls.set({ x: xPos });
        xPosRef.current = xPos; // Save latest position
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [speed, controls, isHovering, brands]);

  return (
    <div className="">
      <h1 className="text-center font-semibold uppercase pb-10">{text}</h1>
      <div
        className={`relative w-full overflow-hidden`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <motion.div
          ref={marqueeRef}
          animate={controls}
          className={`flex ${
            type === "big-text" || type === "label"
              ? "gap-16 whitespace-nowrap"
              : "gap-8 whitespace-nowrap"
          }`}
          style={{ width: "max-content" }}
        >
          {marqueeItems.map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className="flex-shrink-0 flex flex-col gap-1 items-center justify-center"
            >
              {type === "logo" && brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className={`h-${height} w-auto mx-5 object-contain grayscale hover:grayscale-0 transition duration-300`}
                  loading="eager"
                />
              ) : type === "big-text" ? (
                <span className="text-foreground text-3xl md:text-4xl font-extrabold uppercase tracking-wide hover:text-primary transition-colors duration-300">
                  {brand.name}
                </span>
              ) : (
                <span className="text-lg font-semibold text-foreground hover:text-black transition duration-300">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BrandMarquee;
