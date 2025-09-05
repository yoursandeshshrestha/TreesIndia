import { useQuery } from "@tanstack/react-query";
import { fetchPopularServices } from "@/lib/api";

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
    enabled: enabled, // Allow fetching even without location - backend will handle fallback
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
