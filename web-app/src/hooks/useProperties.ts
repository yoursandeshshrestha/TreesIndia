import { useQuery } from "@tanstack/react-query";
import {
  fetchProperties,
  fetchPropertyById,
  fetchPropertyBySlug,
  fetchFeaturedProperties,
} from "@/lib/propertyApi";
import { PropertyFilters } from "@/types/property";

export function useProperties(filters: PropertyFilters = {}) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => fetchProperties(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePropertyById(id: number) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function usePropertyBySlug(slug: string) {
  return useQuery({
    queryKey: ["property", "slug", slug],
    queryFn: () => fetchPropertyBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useFeaturedProperties(
  limit: number = 8,
  city?: string,
  state?: string
) {
  return useQuery({
    queryKey: ["properties", "featured", limit, city, state],
    queryFn: () => fetchFeaturedProperties(limit, city, state),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
