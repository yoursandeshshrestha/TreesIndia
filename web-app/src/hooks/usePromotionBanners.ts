import { useQuery } from "@tanstack/react-query";
import { fetchPromotionBanners } from "@/lib/api";

export function usePromotionBanners() {
  return useQuery({
    queryKey: ["promotionBanners"],
    queryFn: fetchPromotionBanners,
    select: (data) => {
      // Filter only active banners
      return data.data.filter((banner) => banner.is_active);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
