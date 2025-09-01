import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

const initialData: Product[] = [
  {
    id: 1,
    title: "Wireless Headphones",
    price: 59.99,
    image: '/category/vehicles.png',
    quantity: 1,
  },
  {
    id: 2,
    title: "Running Shoes",
    price: 89.49,
    image: '/category/vehicles.png',
    quantity: 1,
  },
  {
    id: 3,
    title: "Cotton T-shirt",
    price: 19.99,
    image: '/category/vehicles.png',
    quantity: 1,
  },
];

export default function OrderSummary() {
  const sellerName = "Raja";
  const navigate = useNavigate();

  const navigateProductPage = (id: number) => {
    navigate(`/productpage/${id}`);
  };


  return (
    <div className="gap-10 w-full sm:w-[60%] p-2 bg-background/70 rounded-md">
      {/* Left: Cart Items */}
    {
        initialData.map((item)=>(
                  <div
      key={item.id}
      className="border border-ring/30 pb-4 relative"
    >
      <div className="grid items-center grid-cols-3 gap-8 p-3">
        <div
          onClick={() => navigateProductPage(item.id)}
          className="cursor-pointer"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-24 object-contain mx-auto"
          />
        </div>

        <div
          onClick={() => navigateProductPage(item.id)}
          className="col-span-2 cursor-pointer"
        >
          <h4 className="text-md md:text-lg font-semibold">{item.title}</h4>
          <p className="text-xs text-gray-400">
            Seller: <strong>{sellerName}</strong>
          </p>
          <h2 className="text-xl mt-2 font-bold text-create">
            ${Number(item.price * item.quantity).toFixed(2)}
          </h2>
        </div>
      </div>
    </div>
        ))
    }
     
    </div>
  );
}
