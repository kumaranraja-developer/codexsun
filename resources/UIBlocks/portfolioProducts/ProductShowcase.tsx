// ProductShowcase.tsx
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  link: string;
};

type Props = {
  products: Product[];
};

const ProductShowcase: React.FC<Props> = ({ products }) => {
  // Get unique categories from products and add 'all'
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((p) => p.category))
    );
    return ["all", ...uniqueCategories];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const [filerref1, inView1] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });
  const [filerref2, inView2] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  return (
    <div className="relative w-full bg-background">
     
      {/* Top Left Filter */}
      <div ref={filerref1} className="absolute top-4 left-4 flex gap-3">
        {categories.map((cat, index) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1 rounded-full text-sm font-medium shadow-md transition cursor-pointer animate__animated ${
              inView1 ? "animate__fadeInRight" : "opacity-0"
            } ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-primary/10"
            }`}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8 py-16">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-background rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition"
            onClick={() => window.open(product.link, "_blank")}
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-52 object-contain"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.title}</h3>
              <p className="text-sm text-foreground">{product.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Right Filter */}
      {/* <div className="absolute bottom-4 right-4 flex gap-3">
        {categories.map((cat, index) => {
          const reverseIndex = categories.length - 1 - index;
          return (
            <button
              ref={filerref2}
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1 rounded-full text-sm font-medium shadow-md transition cursor-pointer animate__animated ${
                inView2 ? "animate__fadeInLeft" : "opacity-0"
              } ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-primary/10"
              }`}
              style={{ animationDelay: `${reverseIndex * 0.2}s` }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          );
        })}
      </div> */}
    </div>
  );
};

export default ProductShowcase;
