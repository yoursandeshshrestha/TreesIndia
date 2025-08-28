import { useQuery } from "@tanstack/react-query";
import { fetchServiceById } from "@/lib/api";

export function useServiceById(id: number) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: () => fetchServiceById(id),
    enabled: !!id,
  });
}
