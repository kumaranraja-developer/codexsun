import { useEffect, useState } from "react";
import apiClient from "../../../resources/global/api/apiClients";
import { useAppContext } from "../../../resources/global/AppContaxt";

interface PromotionSectionProps {
  api: string;
}

interface BannerContent {
  id: string;
  image: string;
}
function PromotionSection({ api }: PromotionSectionProps) {
  const { API_URL } = useAppContext();
  const [promotion, setPromotion] = useState<BannerContent[]>([]);
  const fetchBanner = async () => {
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
      const validItems = detailResponses.filter(Boolean);

      const formatted: BannerContent[] = validItems.map((item: any) => {
        return {
          id: item.name,
          image: `${API_URL}/${item.special_image}`,
        };
      });

      setPromotion(formatted);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  return promotion.length > 0 ? (
    <img
      src={promotion[0].image}
      alt={promotion[0].id}
      className="w-full h-full object-cover rounded-md"
    />
  ) : (
    <img
      src="/assets/Promotion/ads3.png"  //default if no image in db
      alt=""
      className="w-full h-full object-cover rounded-md"
    />
  );
}

export default PromotionSection;
