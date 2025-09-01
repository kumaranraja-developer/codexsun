import React from "react";
import { useInView } from "react-intersection-observer";

type HeroBannerProps = {
  badgeText: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
};

const HeroBanner: React.FC<HeroBannerProps> = ({
  badgeText,
  title,
  subtitle,
  buttonText,
  buttonLink,
}) => {
      const [addressref, inView1] = useInView({ triggerOnce: false, threshold: 0.2 });

  return (
    <div ref={addressref} className={`relative w-full flex justify-center items-center `}>
      <div className={`w-full rounded-3xl bg-gradient-to-b from-foreground via-[#00222A] to-primary p-10 text-center shadow-xl  animate__animated ${inView1 ? "animate__fadeInLeft" : "opacity-0"}`}>
        
        {/* Badge */}
        <div className="flex justify-center">
          <span className="px-5 py-1 mb-6 text-sm font-medium text-primary bg-black/40 border border-yellow-400/30 rounded-full">
            {badgeText}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-200 max-w-2xl mx-auto mb-8">
          {subtitle}
        </p>

        {/* Button */}
        <a
          href={buttonLink}
          className="inline-block bg-background text-foreground font-medium px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:bg-hover transition hover:scale-105 duration-300"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
};

export default HeroBanner;
