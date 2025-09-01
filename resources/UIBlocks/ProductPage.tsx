import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Stepper from "./Stepper";
import OrderSummary from "./OrderSummary";
import AddressSection from "./AddressSection";
import OrderPayment from "./OrderPayment";
import OrderSuccess from "./OrderSuccess";
import VerticalImageList from "./Slider/VerticalImageList";
import Button from "../../resources/components/button/Button";
import apiClient from "../../resources/global/api/apiClients";
import { useAppContext } from "../../apps/global/AppContaxt";
import ZoomImage from "../components/image/ZoomImage";
import FloatContact from "./contact/FloatContact";
import ImageButton from "../../resources/components/button/ImageBtn";
import { IoPricetags } from "react-icons/io5";

interface Product {
  id: number;
  name: string;
  actual_price: string;
  offer_price: string;
  count: number;
  description: string;
  category: string;
  offer: number;
  images?: string[];
  feature?: CatalogFeature[];
  spec_header: string;
  desc_label: string;
  desc_images: string[];
}

interface CatalogFeature {
  profile_label: string;
  idx?: number;
  name: string;
  attribute_name: string;
  property_value: string;
}

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaceOrder, setIsPlaceOrder] = useState(false);
  const navigate = useNavigate();
  const productUrl = window.location.href; //purpose to send product URL to WhatsApp

  const { API_URL } = useAppContext();

  useEffect(() => {
    if (!id) return;

    apiClient
      .get(`/api/resource/Catalog Details/${id}`)
      .then((res) => {
        const data = res.data.data || res.data;

        // console.log("data",data)
        // Collect all image fields like image, image1, image2, etc.
        const imageKeys = Object.keys(data).filter(
          (key) => key.startsWith("image") && data[key]
        );
        const imageList = imageKeys.map((key) => API_URL + data[key]);

        const descImageKeys = Object.keys(data).filter(
          (key) => key.startsWith("desc_image") && data[key]
        );
        const descImageList = descImageKeys.map((key) => API_URL + data[key]);
        setProduct({
          ...data,
          name: data.name,
          actual_price: data.price,
          offer_price: data.product_discount,
          offer: data.product_offer,
          images: imageList,
          description: data.item_description,
          category: data.item_group,
          spec_header: data.spec_header,
          feature: data.catalog_features,
          count: data.stock_qty,
          desc_label: data.manufacturer_label,
          desc_images: descImageList,
        });

        if (imageList.length > 0) {
          setSelectedImage(imageList[0]);
        }
      })
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!product || error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  const steps = [
    {
      title: "Order Summary",
      content: <OrderSummary />,
    },
    {
      title: "Address",
      content: <AddressSection />,
    },
    {
      title: "Payment",
      content: <OrderPayment />,
    },
    {
      title: "Confirmation",
      content: (
        <OrderSuccess
          orderId="ORD12345678"
          paymentId="PAY987654321"
          onContinue={() => navigate("/")}
        />
      ),
    },
  ];

  const handleShare = async () => {
    const productUrl = window.location.href;
    const message = `Hello, I’m interested in this product. Could you please share more details? Product URL: ${productUrl}`;

    if (navigator.share) {
      // Web Share API (mobile & modern browsers)
      try {
        await navigator.share({
          text: "Hello, I’m interested in this product. Could you please share more details?",
          url: productUrl,
        });
        console.log("Shared successfully!");
        return;
      } catch (err) {
        console.error("Share cancelled or failed", err);
      }
    }

    // Fallback for unsupported browsers (Firefox desktop, etc.)
    try {
      await navigator.clipboard.writeText(message);
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank");

      alert("Link copied to clipboard! You can Share it to anyone.");
    } catch (err) {
      // If clipboard fails, fallback to mailto or WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <div className="py-10 sm:px-[5%] mx-auto">
      <div className="grid lg:grid-cols-2 gap-5 xl:grid-cols-[35%_65%] items-start border-b border-ring/30 pb-20">
        {/* Image Section */}
        <div className="lg:sticky top-20 h-fit">
          <div className="flex flex-col border border-ring/30 p-2 lg:flex-row gap-4 items-start relative">
            <div className="hidden lg:block">
              <VerticalImageList
                images={product.images || []}
                selectedIndex={(product.images || []).findIndex(
                  (img) => img === selectedImage
                )}
                onSelect={(index) => setSelectedImage(product.images![index])}
              />
            </div>
            <ImageButton
              icon={"like"}
              className="!rounded-full border border-ring/30 p-2 absolute top-5 right-5 z-10"
            />

            {/* main image */}
            <div className="block m-auto flex-1">
              <div className="w-full max-w-[310px] flex items-center h-[310px] mx-auto">
                <ZoomImage
                  src={selectedImage}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-contain rounded transition duration-300 ease-in-out"
                />
              </div>
            </div>

            <div className="lg:hidden mt-4 w-[310px] block mx-auto overflow-x-auto">
              <VerticalImageList
                images={product.images || []}
                selectedIndex={(product.images || []).findIndex(
                  (img) => img === selectedImage
                )}
                direction="horizontal"
                onSelect={(index) => setSelectedImage(product.images![index])}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-center">
            <FloatContact
              contacts={[
                {
                  id: "whatsapp",
                  contact: "919894244450", // no '+' symbol, just country code + number
                  imgPath: "/assets/svg/whatsapp.svg",
                  defaultMessage: `Hello, I’m interested in this product. Could you please share more details? Product URL: ${productUrl}`,
                },
                {
                  id: "phone",
                  contact: "9894244450",
                  imgPath: "/assets/svg/Mobile.svg",
                },
                {
                  id: "email",
                  contact: "info@techmedia.in", // just the username, no @
                  imgPath: "/assets/svg/mail.svg",
                  defaultMessage: `Hello, I’m interested in this product. Could you please share more details? Product URL: ${productUrl}`,
                },
              ]}
              className=""
              horizontal={true}
              labelPosition="top"
            />
            <div className="flex gap-5 ml-5">
              <img
                src="/assets/svg/share.svg"
                alt=""
                className="w-12 h-12 rounded-full p-2 bg-yellow-500 cursor-pointer"
                onClick={handleShare}
              />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4 px-4">
          <h1 className="text-lg lg:text-2xl font-semibold">{product.name}</h1>
          <h1 className="text-md text-foreground/80">
            {product.description
              ? product.description.replace(/<[^>]*>?/gm, "")
              : ""}
          </h1>

          {/* <div className="text-sm text-foreground/50">
            <span className="bg-green-600 text-white text-xs w-max px-2 py-1 rounded">
              4 ★
            </span>{" "}
            <span>76876 rating</span> & <span>7868 Reviews</span>
          </div> */}
          <p className="text-2xl font-bold flex gap-2">
            ₹ {product.offer_price}{" "}
            <span className="line-through text-sm font-normal block my-auto">
              ₹ {product.actual_price}
            </span>
            <span className="text-sm font-normal block my-auto">
              {" "}
              {product.offer} % Offer{" "}
            </span>
            {/* {product.offer > 0 && (
              <div className="flex items-center">
                <span className="line-through text-sm text-foreground/30">
                  ₹ {prePrice}
                </span>
                <span className="text-sm ml-2 text-create">
                  {product.slideOffer ? product.slideOffer : product.offer} %
                  Offer
                </span>
              </div>
            )} */}
          </p>
          {/* <p className="text-sm text-gray-500">Extra fee</p> */}

          {/* <p className="text-foreground text-md font-semibold">
            Available Offer
          </p>
          {visibleOffers.map((off, index) => (
            <div key={index}>
              <span className="font-semibold">{off.title}</span> {off.content}{" "}
              <Tooltipcomp
                label={"T&C"}
                tip={off.tooltip.message}
                className={"text-update font-bold"}
              />
            </div>
          ))} */}

          {/* {offer.length > 5 && (
            <button
              className="mt-2 text-sm text-blue-600 underline"
              onClick={() => setShowAllOffers(!showAllOffers)}
            >
              {showAllOffers ? "Show Less" : "Show More"}
            </button>
          )} */}

          <div className="flex  justify-between mt-5 gap-4">
            {/* <Button
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              label={" Add to Cart"}
            />

            <Button
              disabled={product.count < 1}
              onClick={() => setIsPlaceOrder(!isPlaceOrder)}
              className={`flex-1 px-4 py-2 rounded transition 
              ${
                product.count < 1
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }
            `}
              label={"Buy Now"}
            /> */}

            <Button
              className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-hover transition"
              label={"Enquire Now"}
              onClick={() => {
                const encodedMsg = encodeURIComponent(
                  `Hello, I’m interested in this product. Could you please share more details? Product URL: ${productUrl}`
                );
                const url = `https://wa.me/${919894244450}${
                  encodedMsg ? `?text=${encodedMsg}` : ""
                }`;
                window.open(url, "_blank");
              }}
            />
          </div>
          <div className="w-[100%] sm:w-[80%] md:w-[50%] flex flex-col gap-5 border-ring/30 rounded-lg bg-primary/10 p-5">
            <div className="flex gap-4">
              <IoPricetags className="w-8 h-8 shrink-0 text-primary" />
              <h1 className="text-lg font-bold">Save Extra on Your Purchase</h1>
            </div>
            <p>
              Make your paymrnt through <span className="font-bold">UPI /  NEFT</span> and avoid online transaction
              charges.
            </p>
            <p>
              for assistance, connect with us on <span className="font-bold">Mobile / Whatsapp: +91 9894244450</span>
            </p>
          </div>
          {/* Specifications */}

          {product.spec_header && (
            <div className="mt-10 border border-ring/30 rounded-md p-5">
              <h2 className="text-3xl font-bold border-b border-ring/30 pb-3 text-foreground/90 mb-4">
                {product.spec_header}
              </h2>

              {(() => {
                // Group catalog_features by profile_label
                const groupedFeatures =
                  product.feature?.reduce(
                    (acc: Record<string, any[]>, item) => {
                      if (!acc[item.profile_label])
                        acc[item.profile_label] = [];
                      acc[item.profile_label].push(item);
                      return acc;
                    },
                    {}
                  ) || {};

                // Sort groups based on the lowest idx in that group
                const sortedGroups = Object.entries(groupedFeatures).sort(
                  (a, b) => {
                    const aIdx = Math.min(...a[1].map((f) => f.idx || 0));
                    const bIdx = Math.min(...b[1].map((f) => f.idx || 0));
                    return aIdx - bIdx;
                  }
                );

                return sortedGroups.map(([profileLabel, fields]) => (
                  <div
                    key={profileLabel}
                    className="mb-6 border-b border-ring/30 pb-3 last:border-0"
                  >
                    <h3 className="text-lg text-foreground font-bold">
                      {profileLabel}
                    </h3>

                    <div className="space-y-1 mt-2">
                      {fields
                        .sort((a, b) => (a.idx || 0) - (b.idx || 0))
                        .map((field) => (
                          <div
                            key={field.name}
                            className="flex gap-3 py-2 text-sm"
                          >
                            <span className="w-[30%] text-foreground/70">
                              {field.attribute_name}
                            </span>
                            <span className="w-[70%] font-medium text-foreground/70">
                              {field.property_value}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          <h1 className="my-5 font-bold text-3xl">{product.desc_label}</h1>

          <div>
            {product.desc_images.map((img, idx) => (
              <img key={idx} src={img} alt="" className="mt-5" />
            ))}
          </div>
          {/* <div className="mt-10">
            <RatingReviews />
          </div> */}
        </div>
      </div>

      {/* Similar Products */}
      <div className="mt-12 mx-2">
        <ProductCard
          title="Similar Items"
          api={`api/resource/Catalog Details?fields=["name"]&filters=[["is_popular", "=", 1]]`}
          ribbon={false}
          id={"is_popular"}
          filterValue={"1"}
        />
      </div>
      {isPlaceOrder && (
        <div className="fixed top-1/2 z-10000 left-1/2 w-full p-2 lg:w-[80%] h-[90vh] transform -translate-x-1/2 -translate-y-1/2 shadow overflow-scroll scrollbar-hide">
          <Stepper
            steps={steps}
            onClose={() => setIsPlaceOrder(!isPlaceOrder)}
            onFinish={() => navigate("/")}
          />
        </div>
      )}
      {isPlaceOrder && (
        <div className="fixed z-1000 top-1/2 left-1/2 w-full h-full bg-black/50 transform -translate-x-1/2 -translate-y-1/2"></div>
      )}
    </div>
  );
}

export default ProductPage;
