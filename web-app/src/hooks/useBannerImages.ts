import { useQuery } from "@tanstack/react-query";
import { fetchBannerImages } from "@/lib/api";

export function useBannerImages() {
  return useQuery({
    queryKey: ["bannerImages"],
    queryFn: fetchBannerImages,
    select: (data) => {
      // Filter only active banners and sort by sort_order
      return data.data
        .filter((banner) => banner.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
