import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import frappeBaseApi from "../../resources/global/api/frappeBaseApi";
import ImageButton from "../components/button/ImageBtn";
import apiClient from "../../resources/global/api/apiClients";
import { useAppContext } from "../../apps/global/AppContaxt";

export interface ProductItem {
  id: string;
  name: string;
  prod_id: number;
  image: string;
  price: number;
  count: number;
}

interface GroupProductCardProps {
  title: string;
  api: string;
  ribbon?: boolean;
  id: string;
}

const GroupProductCard: React.FC<GroupProductCardProps> = ({
  title,
  api,
  ribbon,
  id,
}) => {
  const { API_URL } = useAppContext();

  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>([]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get(api);
      const items = response.data.data || [];

      // Get base URL before query params
      const baseApi = api.split("?")[0];

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

      const formatted: ProductItem[] = validItems.map((item: any) => ({
        id: item.name,
        prod_id: item.product_code,
        name: item.name,
        image: `${API_URL}${item.image_1}`,
        price: item.price || item.standard_rate || 0,
        count: item.stock_qty,
      }));

      setProducts(formatted);
    } catch (error) {
      console.error("Failed to fetch products with fallback images:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [api]);

  const navigateProductPage = (id: string) => {
    navigate(`/productpage/${id}`);
  };

  const isInCart = (id: string) => {
    const storedCart = localStorage.getItem("cart");
    const cart: string[] = storedCart ? JSON.parse(storedCart) : [];
    return cart.includes(id);
  };

  const toggleCart = (id: string) => {
    try {
      const storedCart = localStorage.getItem("cart");
      let cart: string[] = storedCart ? JSON.parse(storedCart) : [];

      if (cart.includes(id)) {
        // Remove from cart
        cart = cart.filter((itemId) => itemId !== id);
      } else {
        // Add to cart
        cart.push(id);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      setProducts((prev) => [...prev]); // Force re-render to update icon colors
    } catch (err) {
      console.error("Failed to update cart in localStorage:", err);
    }
  };
  return (
    <div className="w-full p-4 bg-background/80 border border-ring/30 shadow rounded-md">
      {/* header */}
      <div className="flex justify-between items-center px-2">
        <h1 className="font-bold text-[25px]">{title}</h1>
        <p
          className="text-primary font-medium text-lg mt-2 cursor-pointer hover:underline"
          onClick={() => navigate(`/special/${id}`, { state: { title } })}
        >
          More
        </p>
      </div>

      {/* Grid (2 items per row, max 4 items) */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {products.slice(0, 4).map(
          (product) =>
            product.count > 0 && (
              <div
                key={product.id}
                onClick={() => navigateProductPage(product.id)}
                className="relative group border border-ring/20 rounded-md cursor-pointer hover:-translate-y-2 transition-transform duration-300 overflow-hidden"
              >
                {/* Discount Label */}
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

                {/* Hover Buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 m-2">
                  <ImageButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCart(product.id);
                    }}
                    className={`p-1 rounded-full shadow hover:bg-gray-200 ${
                      isInCart(product.id)
                        ? "bg-green-500 text-white"
                        : "bg-background text-foreground"
                    }`}
                    icon={"cart"}
                  />

                  <ImageButton
                    onClick={(e) => e.stopPropagation()}
                    className="bg-background text-foreground p-1  rounded-full shadow hover:bg-gray-200"
                    icon={"like"}
                  />
                  <ImageButton
                    onClick={(e) => e.stopPropagation()}
                    className="bg-background text-foreground p-1 rounded-full shadow hover:bg-gray-200"
                    icon={"link"}
                  />
                </div>

                {/* Product Image */}
                <div className="w-full relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-[180px] object-contain p-2"
                  />
                  <div className="absolute bottom-0  left-2 text-foreground/60 text-lg px-2 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {product.prod_id}
                  </div>
                  <div className="absolute bottom-0 m-2 right-2 bg-create text-white text-xs px-2 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    4 ★
                  </div>
                </div>

                {/* Title & Price */}
                <div className="p-3">
                  <p className="text-center font-medium text-lg text-foreground/60 mt-2 truncate">
                    {product.name}
                  </p>
                  {product.price !== 0 && (
                    <p className="text-center font-bold mt-1 text-xl">
                      ₹ {product.price}
                    </p>
                  )}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default GroupProductCard;
