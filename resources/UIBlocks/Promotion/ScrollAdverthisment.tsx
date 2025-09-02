import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageButton from "../../components/button/ImageBtn";
import apiClient from "../../../resources/global/api/apiClients";
import Button from "../../../resources/components/button/Button";
import { useAppContext } from "../../../resources/global/AppContaxt";

export interface ScrollAdverthismentItem {
  id: string;
  name: string;
  image: string;
}


interface ScrollAdverthismentProps {
  title: string;
  api: string; // e.g. "/api/resource/Item"
}

const ScrollAdverthisment: React.FC<ScrollAdverthismentProps> = ({
  title,
  api,
}) => {
    const {API_URL} =useAppContext();

  const navigate = useNavigate();
  const [products, setProducts] = useState<ScrollAdverthismentItem[]>([]);
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

      const formatted: ScrollAdverthismentItem[] = validItems.map(
        (item: any) => {
          return {
            id: item.name,
            name: item.display_name, // or item.item_name if you want full name
            image: item.image,
          };
        }
      );

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
    <div className="relative my-5 mx-[5%] max-w-full overflow-hidden ">
      <div className="flex justify-between items-center">
        <h1 className="mt-2 font-bold text-foreground/80 text-[25px]">
          {title}
        </h1>
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
          {products.map((product) => (
            <div
              key={product.id}
              className="relative group min-w-[250px] h-max cursor-pointer flex-shrink-0  duration-300 border border-ring/30"
              onClick={() => navigateProductPage(product.id)}
            >
              <div className="relative h-[220px] bg-gradient-to-r from-red-500 via-green-100 to-blue-500">
                <img
                  src={`${API_URL}/${product.image}`}
                  alt={product.name}
                  className="w-[400px] h-[200px] object-contain rounded-md mx-auto"
                />
                <div>
                  <Button
                    label={"Just From 1999"}
                    className="bg-update text-update-foreground absolute bottom-0 w-full !rounded-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollAdverthisment;
