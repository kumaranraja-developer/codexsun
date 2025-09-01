import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

type TechItem = {
  name: string;
  icon: string; // image url
};

interface TechOrbitProps {
  centerImage: string;
  items: TechItem[];
  radius?: number;
  size?: number;
  arcAngle?: number;
  autoRotateSpeed?: number;
}

const HalfOrbit: React.FC<TechOrbitProps> = ({
  centerImage,
  items,
  radius = 220,
  size = 500,
  arcAngle = Math.PI,
  autoRotateSpeed = 0.1,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [autoRotation, setAutoRotation] = useState(0);
  const [responsiveRadius, setResponsiveRadius] = useState(radius);
  const [responsiveSize, setResponsiveSize] = useState(size);

  // ✅ Update radius/size based on screen width
  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 640) {
        setResponsiveRadius(radius * 0.6); // smaller on mobile
        setResponsiveSize(size * 0.7);
      } else if (window.innerWidth < 1024) {
        setResponsiveRadius(radius * 0.8); // tablet
        setResponsiveSize(size * 0.85);
      } else {
        setResponsiveRadius(radius);
        setResponsiveSize(size);
      }
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, [radius, size]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setAutoRotation((prev) => prev + autoRotateSpeed);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [autoRotateSpeed]);

  const rotation = scrollY * 0.1 + autoRotation;
  const loopedItems = [...items, ...items];

  return (
    <div className="relative flex items-center justify-center py-20">
      <div className="relative z-0">
        <img
          src={centerImage}
          alt="center"
          className="w-32 h-32 sm:w-64 sm:h-64 object-contain"
        />
        <h1 className="text-2xl md:text-4xl font-bold text-center">TECH STACK</h1>
      </div>

      <div
        className="absolute overflow-hidden"
        style={{
          width: responsiveSize,
          height: responsiveSize / 2,
          bottom: "50%",
        }}
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            width: responsiveSize,
            height: responsiveSize,
            rotate: rotation,
          }}
        >
          {loopedItems.map((item, index) => {
            const angle =
              Math.PI - (index / (loopedItems.length)) * arcAngle * 2;
            const x = Math.cos(angle) * responsiveRadius;
            const y = Math.sin(angle) * responsiveRadius;

            return (
              <div
                key={index}
                className="absolute flex flex-col items-center"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% - ${y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <motion.div
                  className="flex flex-col items-center"
                  style={{ rotate: -rotation }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* <p className="text-xs mt-2 text-foreground font-medium">
                    {item.name}
                  </p> */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow-md flex items-center justify-center">
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                    />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default HalfOrbit;
