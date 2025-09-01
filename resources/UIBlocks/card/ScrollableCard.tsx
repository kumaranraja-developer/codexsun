import React, { useState, useEffect } from "react";
import ImageButton from "../../components/button/ImageBtn";
type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  inventoryStatus: "INSTOCK" | "LOWSTOCK" | "OUTOFSTOCK";
};

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Laptop",
    price: 1200,
    image: "laptop.jpg",
    inventoryStatus: "INSTOCK",
  },
  {
    id: 2,
    name: "Phone",
    price: 800,
    image: "phone.jpg",
    inventoryStatus: "LOWSTOCK",
  },
  {
    id: 3,
    name: "Headphones",
    price: 150,
    image: "headphones.jpg",
    inventoryStatus: "OUTOFSTOCK",
  },
  {
    id: 4,
    name: "Camera",
    price: 600,
    image: "camera.jpg",
    inventoryStatus: "INSTOCK",
  },
  {
    id: 5,
    name: "Watch",
    price: 300,
    image: "watch.jpg",
    inventoryStatus: "INSTOCK",
  },
  {
    id: 6,
    name: "Tablet",
    price: 400,
    image: "tablet.jpg",
    inventoryStatus: "LOWSTOCK",
  },
];

export default function ScrollableCard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [numVisible, setNumVisible] = useState(3);

  // Simulate fetching
  useEffect(() => {
    setProducts(sampleProducts);
  }, []);

  // Responsive: update numVisible on resize
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 576) setNumVisible(1);
      else if (window.innerWidth < 768) setNumVisible(2);
      else if (window.innerWidth < 1200) setNumVisible(3);
      else setNumVisible(4);
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const nextSlide = () => {
    if (currentIndex < products.length - numVisible) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getSeverityColor = (status: Product["inventoryStatus"]) => {
    switch (status) {
      case "INSTOCK":
        return "bg-green-500";
      case "LOWSTOCK":
        return "bg-yellow-500";
      case "OUTOFSTOCK":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-full mx-auto p-4">
      <div className="relative overflow-hidden">
        {/* Carousel Wrapper */}
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${currentIndex * (100 / numVisible)}%)`,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="p-4 flex-shrink-0"
              style={{ width: `${100 / numVisible}%` }}
            >
              <div className="border rounded-lg shadow-md p-4 text-center bg-white">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-32 h-32 object-cover mx-auto mb-3"
                />
                <h4 className="font-bold">{product.name}</h4>
                <p className="text-gray-600">${product.price}</p>
                <span
                  className={`inline-block mt-2 text-white px-3 py-1 rounded-full text-sm ${getSeverityColor(
                    product.inventoryStatus
                  )}`}
                >
                  {product.inventoryStatus}
                </span>
                <div className="mt-4 flex justify-center gap-3">
                  <button className="px-3 py-2 rounded-full border hover:bg-gray-100">
                    🔍
                  </button>
                  <button className="px-3 py-2 rounded-full border hover:bg-gray-100">
                    ⭐
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <ImageButton
          icon="left"
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full disabled:opacity-30"
        />
        <ImageButton
          icon="right"
          onClick={nextSlide}
          disabled={currentIndex >= products.length - numVisible}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full disabled:opacity-30"
        />
      </div>
    </div>
  );
}
