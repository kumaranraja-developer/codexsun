type Items = {
  title?: string;
  text: string;
};

type HighlighCardProps = {
  sectionTitle: string;
  items: Items[];
};

export default function HighlighCard({
  sectionTitle,
  items,
}: HighlighCardProps) {
  return (
    <section className="px-5 lg:px-[12%] bg-background text-website-foreground">
      {/* Section Title */}
      <h2 className="text-3xl font-bold text-center pb-8">{sectionTitle}</h2>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-row gap-3 p-6 rounded-lg shadow-md bg-gray-50 hover:shadow-lg transition-shadow duration-300"
          >
            {/* Left Accent Bar */}
            <div
              className="w-2 h-[30%] bg-primary rounded mb-4 shrink-0"
            />

            <div>
              {/* Title (optional) */}
              {item.title && (
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
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
