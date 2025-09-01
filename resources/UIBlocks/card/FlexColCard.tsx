import React, { useState } from "react";
import { useInView } from "react-intersection-observer";

type FlexColCardItem = {
  id: string;
  label: string;
  title: string;
  description: string;
  navLink: string;
  image: string;
  subImages: string[];
};

type Props = {
  heading?: string;
  items: FlexColCardItem[];
};

const FlexColCard: React.FC<Props> = ({ items, heading }) => {
  const [activeTab, setActiveTab] = useState(items[0].id);

  const activeContent = items.find((item) => item.id === activeTab);
  const [menuref, inView] = useInView({ triggerOnce: false, threshold: 1 });
  const [cardref, inView2] = useInView({ triggerOnce: false, threshold: 0.4 });

  return (
    <div className="rounded-xl">
      {/* Tab Navigation */}
      <div className="flex gap-4 flex-col pb-3 ">
        <h1 className="text-4xl md:text-6xl font-bold my-5 text-center">
          {heading}
        </h1>
        <div
          ref={menuref}
          className="block space-x-3 border border-ring/30 rounded-lg bg-primary/10 p-2 w-max mx-auto shadow-2xl"
        >
          {items.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ animationDelay: `${index * 0.3}s` }} // 0.2s stagger delay
              className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer animate__animated ${
                inView ? "animate__fadeInDown" : "opacity-0"
              } ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-background border border-ring/30 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      {activeContent && (
        <div ref={cardref} className="mt-8 md:mt-15 grid md:grid-cols-2 gap-8 items-center">
          {/* Left Text Content */}
          <div className={`order-2 md:order-1 animate__animated ${inView2 ? "animate__fadeInLeft" : "opacity-0"}`}>
            <h2 className="text-2xl md:text-4xl md:w-[80%] font-bold mb-3">
              {activeContent.title}
            </h2>
            <p className="text-foreground md:w-[80%] mb-4">
              {activeContent.description}
            </p>
            <a
              href={activeContent.navLink}
              className="text-primary font-semibold hover:underline"
            >
              Learn More →
            </a>
            <div className="flex gap-2 mt-5">
              {activeContent.subImages.map((sub, idx) => (
                <img
                  key={idx}
                  src={sub}
                  alt={`sub-${idx}`}
                  className="rounded-lg shadow w-12 h-12 object-scale-down"
                />
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className={`order-1 md:order-2 animate__animated ${inView2 ? "animate__fadeInRight" : "opacity-0"}`}>
            <img
              src={activeContent.image}
              alt={activeContent.label}
              className="rounded-lg shadow mb-4 block m-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FlexColCard;
