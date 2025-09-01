import { useInView } from "react-intersection-observer";

type Card2Item = {
  title: string;
  body: string;
  animate: string;
};

type Card2Props = {
  items: Card2Item[];
  containerStyle?: string;
  lineStyle?: string;
};

export default function Card2({
  items,
  containerStyle,
  lineStyle,
}: Card2Props) {
  return (
    <div className={`grid gap-8 ${containerStyle}`}>
      {items.map((item, idx) => {
        const { ref, inView } = useInView({ triggerOnce: true });

        return (
          <div
            ref={ref}
            key={idx}
            style={{ animationDelay: `${idx * 0.2}s` }}
            className={`flex items-start gap-4 p-4 rounded-lg shadow-md bg-gray-50 transition-all duration-700 ${
              inView ? item.animate : "opacity-0"
            }`}
          >
            <div className={`w-2 h-8 bg-green-600 rounded ${lineStyle}`} />
            <div className="flex flex-col gap-3">
              <p className="text-lg font-medium text-gray-700">{item.title}</p>
              <p className="text-sm font-medium text-gray-700">{item.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
