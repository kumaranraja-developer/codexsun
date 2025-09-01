import React, { useEffect, useRef, useState } from "react";

interface CardData {
  title: string;
  description: string;
  image: string;
  hoverColor: string;
}

interface AnimatedCardProps {
  cards: CardData[];
  title: string;
  description: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  title,
  description,
  cards,
}) => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]); // track visible cards
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768; // breakpoint for mobile

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setVisibleCards((prev) =>
              prev.includes(index) ? prev : [...prev, index]
            );
            if (isMobile) observer.unobserve(entry.target); // animate once on mobile
          }
        });
      },
      { threshold: 0.2 } // trigger when 20% visible
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const getAnimation = (index: number) => {
    if (!visibleCards.includes(index)) return "opacity-0"; // hidden until visible
    if (index === 0) return "animate__fadeInLeft";
    if (index === cards.length - 1) return "animate__fadeInRight";
    return "animate__fadeInUp";
  };

  return (
    <div className="px-4 md:px-[10%]">
      <h1 className="text-center text-4xl font-bold py-5">{title}</h1>
      <h2 className="text-center pb-5">{description}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            data-index={index}
       ref={(el) => {
  cardRefs.current[index] = el;
}}

            className={`
              relative group bg-white shadow-lg rounded-2xl overflow-hidden cursor-pointer mt-5
              animate__animated ${getAnimation(index)}
            `}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {/* Gradient Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t ${card.hoverColor} opacity-0 group-hover:opacity-90 transition-opacity duration-500`}
            ></div>

            {/* Image/Icon */}
            <div className="flex justify-center p-6">
              <img
                src={card.image}
                alt={card.title}
                loading="lazy"
                className="w-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <div className="relative px-6 text-center transition-all duration-500 group-hover:-translate-y-6">
              <h3 className="text-2xl font-semibold text-gray-800 group-hover:text-white transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500 mt-3 opacity-0 group-hover:opacity-100 group-hover:text-white transition-opacity duration-500">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedCard;
