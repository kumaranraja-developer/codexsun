import { useState } from "react";
export const AdvertisementBanner2 = () => {
  const [advertisment] = useState({
    title: "Discover Our New Collection",
    description:
      "Upgrade your style with top-quality products. Limited time offer!",
    button: { label: "Shop Now", className: "" },
    bgimg: "",
    images: [
      { src: '/assets/products/laptop.webp', label: "Saree" },
      { src: '/assets/products/laptop.webp', label: "Saree" },
      { src: '/assets/products/laptop.webp', label: "Saree" },
      { src: '/assets/products/laptop.webp', label: "Saree" },
    ],
  });
  return (
    <div
      className="relative w-full h-[60vh] lg:h-[80vh] overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url('/assets/adverthisment.png')` }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>

      <div className="relative z-10 flex h-full px-6 md:px-16">
        {/* Left side: text + button */}
        <div className="w-1/2 flex flex-col justify-center text-white space-y-4">
          <h2 className="text-3xl lg:text-7xl font-bold">
            {advertisment.title}
          </h2>
          <p className="text-xl lg:text-2xl max-w-md">
            {advertisment.description}
          </p>
          <button
            className={`bg-update text-update-foreground px-6 py-2 rounded lg:text-lg transition w-fit ${advertisment.button.className}`}
          >
            {advertisment.button.label}
          </button>
        </div>

        {/* Right side: 2 stacked images */}
        <div className="w-1/2 grid grid-cols-2 gap-4 justify-items-end items-center pl-4">
          {advertisment.images.map((img) => (
            <div className="hover:-translate-y-2 duration-300">
              <img
                src={img.src}
                alt="Ad 1"
                className="object-cover rounded shadow-md"
              />
              <p className=" text-lg font-bold text-white text-center">
                {img.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvertisementBanner2;
