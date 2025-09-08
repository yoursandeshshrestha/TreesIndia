import { useQuery } from "@tanstack/react-query";
import {
  fetchProperties,
  fetchPropertyById,
  fetchPropertyBySlug,
  fetchFeaturedProperties,
  fetchUserProperties,
} from "@/lib/propertyApi";
import { PropertyFilters } from "@/types/property";
import { authAPI } from "@/lib/auth-api";

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

export function useUserProperties(page: number = 1, limit: number = 20) {
  const token = authAPI.getAccessToken();

  return useQuery({
    queryKey: ["userProperties", page, limit],
    queryFn: () => fetchUserProperties(page, limit),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
