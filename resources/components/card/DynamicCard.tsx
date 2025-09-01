import { useInView } from 'react-intersection-observer';

interface CardList {
  image: string;
  title: string;
  animate: string;
}

interface DynamicCardProps {
  Card: CardList[];
  rounded?: boolean;
  containerStyle?: string;
}

function DynamicCard({ Card, rounded = false, containerStyle }: DynamicCardProps) {
  return (
    <div className={`grid gap-6 ${containerStyle}`}>
      {Card.map((card, index) => {
        const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

        return (
          <div
            ref={ref}
            key={index}
            style={{ animationDelay: `${index * 0.2}s` }}
            className={`p-4 block m-auto transition-all hover:-translate-y-2 duration-700 ${
              inView ? card.animate : 'opacity-0'
            }`}
          >
            <img
              src={card.image}
              alt={card.title}
              className={`object-scale-down ${
                rounded ? 'w-64 h-64 rounded-full' : 'w-full h-64 rounded'
              }`}
            />
            <h1 className="text-xl text-center font-semibold mt-2 uppercase text-foreground">{card.title}</h1>
          </div>
        );
      })}
    </div>
  );
}

export default DynamicCard;
