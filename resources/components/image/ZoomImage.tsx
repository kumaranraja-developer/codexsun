import React, { useRef, useState } from "react";

interface ZoomImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const ZoomImage: React.FC<ZoomImageProps> = ({ src, alt, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomStyles, setZoomStyles] = useState({
    visible: false,
    backgroundPosition: "0% 0%",
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const { left, top, width, height } = container.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyles({
      visible: true,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyles((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="relative flex" ref={containerRef}>
      {/* Original image */}
      <div
        className="relative w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain rounded transition duration-300 ease-in-out lg:cursor-crosshair ${className}`}
          loading="lazy"
        />
      </div>

      {/* Zoomed Preview (to the right side) */}
      {zoomStyles.visible && (
        <div
          className="absolute left-full top-0 ml-4 bg-background w-[500px] h-[500px] border border-gray-300 shadow-lg rounded-lg bg-no-repeat bg-contain pointer-events-none z-50 hidden md:block "
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: zoomStyles.backgroundPosition,
            backgroundSize: "150%",
          }}
        />
      )}
    </div>
  );
};

export default ZoomImage;
