import { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageButton from "../components/button/ImageBtn";
import { Heart } from "lucide-react";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

interface State {
  cartItems: Product[];
}

type Action = { category: "increase" | "decrease" | "remove"; payload: number };

const initialData: Product[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  title: `Product ${i + 1}`,
  price: 29.99 + i,
  image: '/assets/category/vehicles.png',
  category: "Category",
  quantity: 1,
}));
const count=initialData.length
export default function Wishlist() {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(10); // default items shown

  const [state, dispatch] = useReducer(reducer, {
    cartItems: initialData,
  });

  function reducer(state: State, action: Action): State {
    const { cartItems } = state;

    switch (action.category) {
      case "increase":
      case "decrease":
        return {
          ...state,
          cartItems: cartItems.map((item) =>
            item.id === action.payload
              ? {
                  ...item,
                  quantity:
                    action.category === "increase"
                      ? item.quantity + 1
                      : Math.max(1, item.quantity - 1),
                }
              : item
          ),
        };

      case "remove":
        return {
          ...state,
          cartItems: cartItems.filter((item) => item.id !== action.payload),
        };

      default:
        return state;
    }
  }

  const navigateProductPage = (id: number) => {
    navigate(`/productpage/${id}`);
  };

  const renderItemCard = (item: Product) => (
    <div
      key={item.id}
      className="border-b border-ring/30 pb-4 relative last:border-0 group"
    >
      <div className="grid grid-cols-[20%_70%] gap-8 px-5 relative">
        <div
          onClick={() => navigateProductPage(item.id)}
          className="cursor-pointer"
        >
          <img
            src={item.image}
            alt={item.title}
            className="object-contain w-30 mx-auto"
          />
        </div>

        <div
          onClick={() => navigateProductPage(item.id)}
          className="cursor-pointer"
        >
          <h4 className="text-lg font-semibold group-hover:text-update transition-colors duration-200">
            {item.title}
          </h4>
          <p className="text-sm text-gray-500">{item.category}</p>
          <p className="text-xs text-gray-400">
            Seller: <strong>Raja</strong>
          </p>
          <h2 className="text-xl mt-2 font-bold text-create">
            ₹ {Number(item.price * item.quantity).toFixed(2)}
          </h2>
        </div>

        <div className="flex flex-col gap-4 justify-center items-center text-sm absolute right-0">
          <ImageButton
            className="p-2 text-create hover:border hover:border-ring/30"
            onClick={() => dispatch({ category: "remove", payload: item.id })}
            icon={"cart"}
          />
          <ImageButton
            className="p-2 text-delete hover:border hover:border-ring/30"
            onClick={() => dispatch({ category: "remove", payload: item.id })}
            icon={"delete"}
          />
        </div>
      </div>
    </div>
  );

  const visibleItems = state.cartItems.slice(0, visibleCount);

  return (
    <div className="my-10 lg:px-[10%] gap-10 p-5">
      <div className="flex gap-2 items-center my-5">
        <Heart size={25} className="text-red-500" />
        <h1 className="text-2xl font-bold">My Wishlist <span className="font-normal">({count})</span></h1>
      </div>

      <div className="space-y-8 overflow-auto">
        <div className="space-y-4 p-5 border border-ring/30 rounded-md">
          {visibleItems.map((item) => renderItemCard(item))}

          {visibleCount < state.cartItems.length && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="px-6 py-2 bg-update text-white rounded-md hover:bg-update/90"
              >
                Show More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
