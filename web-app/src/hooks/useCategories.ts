import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/api";

interface UseCategoriesOptions {
  enabled?: boolean;
}

export function useCategories({ enabled = true }: UseCategoriesOptions = {}) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
