
import React from 'react';

type Items = {
  id: number;
  title: string;
  description: string;
  features: string[];
};

type CardViewProps = {
  items: Items[]; // now an array of items
};

const CardView: React.FC<CardViewProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:px-[12%] gap-6  mx-3">
      {items.map((item) => (
        <div key={item.id} className="bg-gradient-to-tr from-primary/20 to-background rounded-xl p-6 border border-ring/30 hover:shadow-2xl hover:border-0">
          <h3 className="text-lg font-bold mb-2">{item.id}. {item.title}</h3>
          <p className="text-foreground/70 mb-4 text-justify">{item.description}</p>
          <ul className="space-y-2">
            {item.features.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-green-500 mr-2">✔</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default CardView;
