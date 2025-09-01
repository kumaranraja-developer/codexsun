// Articles.tsx
import React from "react";
import Button from "../../components/button/Button";

export type Article = {
  image: string;
  title: string;
  description: string;
  path: string;
};

export type ArticlesProps = {
  sectionTitle: string;
  sectionDescription: string;
  articles: Article[];
};

const Articles: React.FC<ArticlesProps> = ({
  sectionTitle,
  sectionDescription,
  articles,
}) => {
  return (
    <section className="py-20 lg:px-[12%] flex flex-col gap-4">
      {/* Section Title */}
      <div className="text-center font-bold text-4xl">{sectionTitle}</div>

      {/* Section Description */}
      <div className="text-center mt-8 md:w-[70%] mx-auto">
        {sectionDescription}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-3 mt-5">
        {articles.map((article, index) => (
          <div key={index} className="flex flex-col gap-3 mt-8 sm:mt-0">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-auto object-cover"
            />
            <div className="text-2xl lg:text-xl font-bold line-clamp-1 lg:line-clamp-2">
              {article.title}
            </div>
            <div className="text-lg line-clamp-2 lg:line-clamp-3">
              {article.description}
            </div>
            <Button
              label="Read More"
              path={article.path}
              className="bg-gray-200 w-max text-black px-4"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Articles;
