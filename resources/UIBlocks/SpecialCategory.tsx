import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../../resources/global/api/apiClients";
import ImageButton from "../components/button/ImageBtn";
import { useAppContext } from "../../apps/global/AppContaxt";

type ProductType = {
  id: number;
  name: string;
  image: string;
  category: string;
  description: string;
  count: number;
  price: number;
  prod_id: number;
};


const SpecialCategory= () => {
  const { API_URL } = useAppContext();
  const location=useLocation()

  const [products, setProducts] = useState<ProductType[]>([]);
  const [cartStates, setCartStates] = useState<Record<number, string>>({});
  const [, setError] = useState<string | null>(null);
  const { category } = useParams();
  const navigate = useNavigate();

  const {id}=useParams();
  const value=location.state?.filterValue || 1;
  console.log("value", value);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get(`api/resource/Catalog Details?fields=["name"]&filters=[["${id}", "=", "${value}"]]`);
        const items = res.data.data || [];
        const detailPromises = items.map((item: any) => {
          const itemName = encodeURIComponent(item.name);
          return apiClient
            .get(`/api/resource/Catalog Details/${itemName}`)
            .then((r) => r.data.data)
            .catch(() => null);
        });

        const detailResponses = await Promise.all(detailPromises);
        let formatted: ProductType[] = detailResponses
          .filter(Boolean)
          .map((item: any) => ({
            id: item.name,
            prod_id: item.product_code,
            name: item.name,
            description: item.item_description,
            image: `${API_URL}/${item.image_1}`,
            count: item.stock_qty,
            price: item.price || item.standard_rate || 0,
            category: item.category || "",
          }));

        // If category param is passed in URL, filter by it
        if (category) {
          formatted = formatted.filter((item) =>
            item.category.toLowerCase().includes(category.toLowerCase())
          );
        }

        setProducts(formatted);
      } catch (err) {
        setError("Failed to fetch products");
      }
    };

    fetchProducts();
  }, [API_URL, category]);

  const navigateProductPage = (id: number) => {
    navigate(`/productpage/${id}`);
  };

  const changeCart = (id: number) => {
    setCartStates((prev) => ({
      ...prev,
      [id]: prev[id] === "Add to Cart" ? "Added to Cart" : "Add to Cart",
    }));
  };

  return (
    <div className="md:mt-5 px-[5%] py-5">
        <h1 className="font-bold text-center text-2xl lg:text-5xl pb-10">{location.state.title}</h1>
      <div className="grid lg:grid-cols-2 gap-5 space-y-3">
        {products.map((product) => (
          <div key={product.id} className="border border-ring/30 rounded h-full flex flex-col">
            <div className="grid grid-cols-[45%_55%] md:grid-cols-[25%_45%_25%] mx-5 gap-4 p-4">
              <div
                onClick={() => navigateProductPage(product.id)}
                className="w-full h-full aspect-square overflow-hidden rounded-md cursor-pointer"
              >
                <img
                  className="w-full h-full object-scale-down rounded-md"
                  src={product.image}
                  alt={product.name}
                />
              </div>

              <div
                className="space-y-2 px-2 cursor-pointer"
                onClick={() => navigateProductPage(product.id)}
              >
                <h4 className="text-sm lg:text-lg font-semibold text-update/90 line-clamp-3">
                  {product.name}
                </h4>
                <h2 className="text-xl font-bold block md:hidden">
                  ₹ {product.price}
                </h2>
                <h1 className="text-sm text-foreground/50 line-clamp-2">
            {product.description
              ? product.description.replace(/<[^>]*>?/gm, "")
              : ""}
          </h1>
                {/* <div className="flex gap-2">
                  <p className="text-sm text-green-600">10% Offer</p>
                </div> */}
                <div className="my-2 mt-5 flex flex-row gap-2 ">
                  <ImageButton
                    onClick={(e) => {
                      e.stopPropagation();
                      changeCart(product.id);
                    }}
                    icon="cart"
                    className={`p-2 rounded-full shadow ${
                      cartStates[product.id] === "Added to Cart"
                        ? "bg-green-600 text-white"
                        : "bg-background text-foreground hover:bg-gray-200"
                    }`}
                  />
                  <ImageButton
                    onClick={(e) => e.stopPropagation()}
                    className="bg-background text-foreground p-2 rounded-full shadow hover:bg-gray-200"
                    icon={"like"}
                  />
                  <ImageButton
                    onClick={(e) => e.stopPropagation()}
                    className="bg-background text-foreground p-2 rounded-full shadow hover:bg-gray-200"
                    icon={"link"}
                  />
                </div>
              </div>

              <div className="text-right space-y-2 hidden md:block">
                {/* <div
                  className={`w-max block ml-auto text-white text-xs px-2 py-1 z-10 ${
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
                </div> */}
                <h2 className="text-sm md:text-xl font-bold">
                  ₹ {product.price}
                </h2>
                <p className="text-sm text-foreground/60">Delivery: 3–5 days</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialCategory;
