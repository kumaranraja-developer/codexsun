type NexusCardItem = {
  logo: string;
  alt: string;
  title: string;
  className?: string; // custom styles per block
};

type NexusCardProps = {
  sectionTitle: string;
  sectionDescription: string;
  leftClassName?: string; // styling for left content
  rightClassName?: string; // styling for right grid
  items: NexusCardItem[];
};

export default function NexusCard({
  sectionTitle,
  sectionDescription,
  leftClassName,
  rightClassName,
  items,
}: NexusCardProps) {
  return (
    <section className="bg-[#1E0478] text-white py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* LEFT CONTENT */}
        <div className={leftClassName}>
          <h2 className="text-4xl font-bold mb-4">{sectionTitle}</h2>
          <p className="text-lg text-gray-200">{sectionDescription}</p>
        </div>

        {/* RIGHT CONTENT (LOGOS GRID) */}
        <div className={`grid grid-cols-3 gap-4 max-w-lg mx-auto ${rightClassName || ""}`}>
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 flex flex-col items-center justify-center rounded-lg ${item.className || ""}`}
            >
              <img src={item.logo} alt={item.alt} className="h-10 mb-2" />
              <p>{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
