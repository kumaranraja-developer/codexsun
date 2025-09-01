import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../resources/global/api/apiClients";
import ImageButton from "../components/button/ImageBtn";
import type { ProductItem } from "./ProductCard";
import { useAppContext } from "../../apps/global/AppContaxt";

// export interface ProductItem {
//   id: string;
//   name: string;
//   prod_id: number;
//   image: string;
//   price: number;
//   count: number;
// }

interface ProductCardProps {
  title: string;
  api: string; // e.g. "/api/resource/Item"
  ribbon?: boolean;
}

const ProductCard2: React.FC<ProductCardProps> = ({ title, api, ribbon }) => {
  const { API_URL } = useAppContext();

  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const fetchProducts = async () => {
    try {
      // Step 1: Fetch all item names
      const response = await apiClient.get(`${api}`);
      const items = response.data.data || [];

      // Step 2: Fetch full details for each item
      const baseApi = api.split("?")[0];

      // Step 2: Fetch full details for each item
      const detailPromises = items.map((item: any) => {
        const itemName = encodeURIComponent(item.name);
        const detailUrl = `${baseApi}/${itemName}`;
        return apiClient
          .get(detailUrl)
          .then((res) => res.data.data)
          .catch((err) => {
            console.warn(`Item not found: ${item.name}`, err);
            return null;
          });
      });

      const detailResponses = await Promise.all(detailPromises);
      const validItems = detailResponses.filter(Boolean);

      const formatted: ProductItem[] = validItems.map((item: any) => {
        return {
          id: item.name,
          prod_id: item.product_code,
          name: item.display_name, // or item.item_name if you want full name
          image: item.image_1,
          count: item.stock_qty,
          price: item.price || item.standard_rate || 0,
        };
      });

      setProducts(formatted);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [api]);

  const checkScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isOverflowing = el.scrollWidth > el.clientWidth;
    const atStart = el.scrollLeft <= 10;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
    setShowLeft(isOverflowing && !atStart);
    setShowRight(isOverflowing && !atEnd);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollButtons();
    el.addEventListener("scroll", checkScrollButtons);
    window.addEventListener("resize", checkScrollButtons);
    return () => {
      el.removeEventListener("scroll", checkScrollButtons);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const navigateProductPage = (id: string) => {
    navigate(`/productpage/${id}`);
  };

  return (
    <div className="relative my-5 mx-[5%] max-w-full overflow-hidden border border-ring/30 rounded-md">
      <div className="flex justify-between items-center px-3">
        <h1 className="mt-2 font-bold text-foreground/80 text-[25px]">
          {title}
        </h1>
        <p className="text-update text-lg mt-2 cursor-pointer hover:underline">
          More
        </p>
      </div>

      {showLeft && (
        <ImageButton
          onClick={() => scroll("left")}
          className="absolute left-2 top-[55%] -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-200"
          icon={"left"}
        />
      )}

      {showRight && (
        <ImageButton
          onClick={() => scroll("right")}
          className="absolute right-2 top-[55%] -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-200"
          icon={"right"}
        />
      )}

      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide mt-4">
        <div className="flex gap-4 min-w-max py-2">
          {products.map(
            (product) =>
              product.count > 0 && (
                <div
                  key={product.id}
                  className="relative group min-w-[250px] h-max rounded-md p-2 cursor-pointer flex-shrink-0 transition-transform hover:-translate-y-2 duration-300"
                  onClick={() => navigateProductPage(product.id)}
                >
                  {ribbon && (
                    <div
                      className={`absolute top-2 m-2 left-2 text-white text-xs px-2 py-1 z-10 ${
                        product.count > 0
                          ? product.count < 3
                            ? `bg-purple-500`
                            : "bg-update"
                          : "bg-delete"
                      }`}
                    >
                      {product.count > 0
                        ? product.count < 3
                          ? `only ${product.count} left`
                          : "10% Offer"
                        : "Out Of Stock"}
                    </div>
                  )}

                  <div className="absolute top-2 right-2 m-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <ImageButton
                      onClick={(e) => e.stopPropagation()}
                      className="bg-background text-foreground p-1 rounded-full shadow hover:bg-gray-200"
                      icon={"cart"}
                    />
                    <ImageButton
                      onClick={(e) => e.stopPropagation()}
                      className="bg-background text-foreground p-1 rounded-full shadow hover:bg-gray-200"
                      icon={"like"}
                    />
                    <ImageButton
                      onClick={(e) => e.stopPropagation()}
                      className="bg-background text-foreground p-1 rounded-full shadow hover:bg-gray-200"
                      icon={"link"}
                    />
                  </div>

                  <div className="relative">
                    <img
                      src={`${API_URL}/${product.image}`}
                      alt={product.name}
                      className="w-[200px] h-[200px] object-contain rounded-md mx-auto"
                    />
                    <div className="absolute bottom-0 left-2 text-foreground/60 text-lg px-2 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {product.prod_id}
                    </div>
                    <div className="absolute bottom-0 m-2 right-2 bg-create text-white text-xs px-2 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      4 ★
                    </div>
                  </div>

                  <p className="text-center font-medium text-sm mt-2 max-w-[250px] truncate">
                    {product.name}
                  </p>

                  <p className="text-center font-bold mt-1 text-base">
                    ₹ {product.price}
                  </p>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard2;
