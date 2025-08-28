import { useQuery } from "@tanstack/react-query";
import { fetchSubcategories } from "@/lib/api";

interface UseSubcategoriesOptions {
  categoryId: number;
  enabled?: boolean;
}

export function useSubcategories({ categoryId, enabled = true }: UseSubcategoriesOptions) {
  return useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: () => fetchSubcategories(categoryId),
    enabled: enabled && categoryId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
