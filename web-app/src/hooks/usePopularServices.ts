import { useQuery } from "@tanstack/react-query";
import { fetchPopularServices } from "@/lib/api";
import { PopularService } from "@/types/api";

interface UsePopularServicesOptions {
  city?: string;
  state?: string;
  enabled?: boolean;
}

export function usePopularServices({
  city,
  state,
  enabled = true,
}: UsePopularServicesOptions) {
  return useQuery({
    queryKey: ["popularServices", city, state],
    queryFn: () => fetchPopularServices(city, state),
    enabled: enabled && (city !== undefined || state !== undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
