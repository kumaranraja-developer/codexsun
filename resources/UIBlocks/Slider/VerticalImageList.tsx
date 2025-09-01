import ImageButton from "../../components/button/ImageBtn";
import { useRef } from "react";

interface VerticalImageListProps {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  direction?: "vertical" | "horizontal"; // Optional, defaults to vertical
}

export default function VerticalImageList({
  images,
  selectedIndex,
  onSelect,
  direction = "vertical",
}: VerticalImageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isVertical = direction === "vertical";

  const scroll = () => {
    if (scrollRef.current) {
      const scrollAmount = 100;
      if (isVertical) {
        scrollRef.current.scrollBy({
          top: scrollAmount,
          behavior: "smooth",
        });
      } else {
        scrollRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  const scrollReverse = () => {
    if (scrollRef.current) {
      const scrollAmount = 100;
      if (isVertical) {
        scrollRef.current.scrollBy({
          top: -scrollAmount,
          behavior: "smooth",
        });
      } else {
        scrollRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div
      className={`flex items-center ${
        isVertical ? "flex-col w-16 space-y-2" : "flex-row w-full space-x-2"
      }`}
    >
      {/* Scroll Button (Prev) */}
      <ImageButton
        className="w-8 h-full flex items-center justify-center text-xl bg-background"
        onClick={scrollReverse} icon={`${isVertical ? "up" : "left"}`}      />

      {/* Scrollable List */}
      <div
        ref={scrollRef}
        className={`scrollbar-hide border-ring/30 ${
          isVertical
            ? "h-[320px] overflow-y-auto flex flex-col space-y-2"
            : "w-[full] overflow-x-auto flex flex-row space-x-2"
        }`}
      >
        {images.map((img, index) => (
          <div
            key={index}
            onClick={() => onSelect(index)}
            className={`p-1 cursor-pointer border ${
              index === selectedIndex ? "border-blue-500" : "border-transparent"
            }`}
          >
            <img
              src={img}
              alt={`Thumb ${index}`}
              className={`object-cover ${
                isVertical ? "w-full h-auto" : "h-20 min-w-[80px]"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Scroll Button (Next) */}
      <ImageButton
        className="w-8 h-full flex items-center justify-center text-xl bg-background"
        onClick={scroll} icon={`${isVertical ? "down" : "right"}`}
      />
       
    </div>
  );
}
