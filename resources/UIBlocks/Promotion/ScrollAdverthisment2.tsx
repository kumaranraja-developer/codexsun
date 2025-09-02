import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageButton from "../../components/button/ImageBtn";
import apiClient from "../../../resources/global/api/apiClients";
import { useAppContext } from "../../../resources/global/AppContaxt";

export interface ScrollAdverthismentItem {
  id: string;
  image: string;
}

interface ScrollAdverthisment2Props {
  title: string;
  api: string;
}

const ScrollAdverthisment2: React.FC<ScrollAdverthisment2Props> = ({
  title,
  api,
}) => {
  const { API_URL } = useAppContext();
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

      // Step 3: Filter only items where make_this_default is truthy
      const validItems = detailResponses.filter(
        (item) => item && item.make_this_default
      );

      // Step 4: Flatten all featured images into products[]
      const formatted: ScrollAdverthismentItem[] = validItems.flatMap(
        (item: any) =>
          (item.table_hxwm || []).map((row: any) => ({
            id: String(row.name), // ensure string
            image: `${API_URL}${row.featured_image}`,
          }))
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

      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide mt-4"
      >
        <div className="flex gap-4 min-w-max py-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative group w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] cursor-pointer flex-shrink-0  duration-300 border border-ring/30 rounded-2xl"
              onClick={() => navigateProductPage(product.id)}
            >
              <div className="relative w-[300px] sm:w-[400px] sm:h-[400px] overflow-hidden rounded-2xl">
                <img
                  src={`${product.image}`}
                  alt={product.id}
                  className="w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] object-contain rounded-md mx-auto"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollAdverthisment2;
