import React from "react";

type Item = {
  title?: string;
  text: string;
  icon?: React.ReactNode; // for React icons
  iconImage?: string; // for image path
};

type HighlightCardProps = {
  sectionTitle: string;
  items: Item[];
  className:string
};

export default function HighlightCardWithIcon({
  sectionTitle,
  items,
  className
}: HighlightCardProps) {
  return (
    <section className="bg-background text-website-foreground">
      {/* Section Title */}
      <h2 className="text-3xl font-bold text-center pb-8">{sectionTitle}</h2>

      {/* Grid */}
      <div className={`grid ${className}  gap-8`}>
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-6 p-6 rounded-lg shadow-md border border-ring/50 bg-gray-50 hover:shadow-lg transition-shadow duration-300"
          >
            {/* Icon Section */}
            <div className="flex justify-start shrink-0">
              {item.icon && (
                <div className="text-primary text-5xl">{item.icon}</div>
              )}
              {item.iconImage && (
                <img
                  src={item.iconImage}
                  alt={item.title || "icon"}
                  className="w-12 h-12 object-contain"
                />
              )}
              {/* <div className="w-2 h-[30%] bg-primary rounded mt-2" /> */}
            </div>

            <div>
              {/* Title (optional) */}
              {item.title && (
                <h3 className="text-xl font-bold text-primary mb-2">
                  {item.title}
                </h3>
              )}

              {/* Description */}
              <p className="text-lg text-gray-700">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
