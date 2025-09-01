import React from "react";
import { motion } from "framer-motion";

type RoadmapItem = {
  year: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
};

interface RoadmapProps {
  items: RoadmapItem[];
  RoadmapHeading: string;
}

const Roadmap: React.FC<RoadmapProps> = ({ items, RoadmapHeading }) => {
  return (
    <section className="overflow-x-hidden">
      <h2 className="text-4xl font-bold text-center mb-15">{RoadmapHeading}</h2>

      <div className="relative max-w-6xl mx-auto">
        {/* Road / Line */}
        <div className="absolute left-1/2 top-0 h-full w-1 bg-gray-300 -translate-x-1/2" />

        <div className="space-y-20">
          {items.map((item, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div key={index} className="relative flex w-full">
                {/* Desktop layout (zigzag) */}
                <div
                  className={`hidden sm:flex w-full ${
                    isLeft ? "justify-start" : "justify-end"
                  }`}
                >
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -200 : 200 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ type: "spring", stiffness: 60, damping: 12 }}
                    className={`w-1/2 ${
                      isLeft ? "pr-10 text-right" : "pl-10 text-left"
                    }`}
                  >
                    <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 relative">
                      <h3 className="text-xl font-semibold">{item.year}</h3>
                      <p className="text-lg font-medium text-gray-700 mt-1">
                        {item.title}
                      </p>
                      <p className="text-gray-500 mt-2">{item.description}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Mobile layout (alternate sides) */}
                <div
                  className={`flex sm:hidden w-full ${
                    isLeft ? "flex-row" : "flex-row-reverse"
                  } items-start`}
                >
                  {/* Pin Marker */}
                  <PinMarker
                    year={item.year}
                    color={item.color}
                    icon={item.icon}
                  />

                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ type: "spring", stiffness: 60, damping: 12 }}
                    className="ml-3 mr-3 flex-1"
                  >
                    <div className="bg-white shadow-lg rounded-2xl p-4 border border-gray-100">
                      <h3 className="text-lg font-semibold">{item.year}</h3>
                      <p className="text-md font-medium text-gray-700 mt-1">
                        {item.title}
                      </p>
                      <p className="text-gray-500 mt-1 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Timeline Pin Marker (desktop) */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center justify-center">
                  <PinMarker
                    year={item.year}
                    color={item.color}
                    icon={item.icon}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;

/* 📍 Pin Marker Component */
const PinMarker: React.FC<{
  year: string;
  color?: string;
  icon?: React.ReactNode;
}> = ({ year, color, icon }) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Circle */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-md relative z-10"
        style={{ backgroundColor: color || "#2563eb" }}
      >
        {icon || (
          <span className="text-white font-bold text-sm">{year.slice(-2)}</span>
        )}
      </div>
      {/* Tail (triangle) */}
      <div
        className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] -mt-1"
        style={{
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: color || "#2563eb",
        }}
      />
    </div>
  );
};
