import { useState } from "react";
import Carousel from "../../components/carousel";

type GallaryCarouselProps = {
  images: string[];
};

export default function GallaryCarousel({ images }: GallaryCarouselProps) {
  const [sliderVisible, setSliderVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="w-full">
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            onClick={() => {
              setSliderVisible(true);
              setSelectedIndex(idx);
            }}
            alt={`Portfolio ${idx + 1}`}
            loading="lazy"
            className="cursor-pointer object-cover w-full h-full rounded shadow hover:scale-102 transition-transform duration-300"
          />
        ))}
      </div>

      {/* Fullscreen Slider */}
      {sliderVisible && (
        <div
          className="bg-black/80 w-full h-full fixed top-0 left-0 z-50 flex items-center justify-center"
          onClick={() => setSliderVisible(false)}
        >
          <div
            className="w-[90%] md:w-[70%] lg:w-[50%] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Carousel
              autoSlide={true}
              startIndex={selectedIndex}
              autoSlideInterval={7000}
            >
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Portfolio slide ${idx + 1}`}
                  loading="lazy"
                  className="rounded"
                />
              ))}
            </Carousel>
          </div>
        </div>
      )}
    </div>
  );
}
