import React, { useEffect, useRef, useState } from "react";

interface TransparentCardProps {
  image: string;
}

const TransparentCard: React.FC<TransparentCardProps> = ({ image }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const visibleRatio = Math.max(
        0,
        Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height))
      );

      const newScale = 1 + visibleRatio * 0.2;
      setScale(newScale);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="w-[80%] px-5 md:w-[70%] mx-auto overflow-hidden border border-white/30 transition-transform duration-500 ease-out"
      style={{ transform: `scale(${scale})` }}
    >
      <div className="overflow-hidden w-full">
        <div className="aspect-[16/9] w-full">
          <img
            src={image}
            alt="Dashboard Preview"
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default TransparentCard;
