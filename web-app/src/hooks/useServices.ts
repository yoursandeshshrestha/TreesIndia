import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "@/lib/api";

interface UseServicesOptions {
  category?: string;
  subcategory?: string;
  type?: "fixed-price" | "inquiry-based";
  price_min?: number;
  price_max?: number;
  exclude_inactive?: boolean;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useServices({
  category,
  subcategory,
  type,
  price_min,
  price_max,
  exclude_inactive = true,
  page,
  limit = 50,
  enabled = true,
}: UseServicesOptions) {
  return useQuery({
    queryKey: [
      "services",
      category,
      subcategory,
      type,
      price_min,
      price_max,
      exclude_inactive,
      page,
      limit,
    ],
    queryFn: () =>
      fetchServices({
        category,
        subcategory,
        type,
        price_min,
        price_max,
        exclude_inactive,
        page,
        limit,
      }),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
