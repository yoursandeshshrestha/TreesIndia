import { useQuery } from "@tanstack/react-query";
import {
  fetchVendors,
  fetchVendorById,
  searchVendors,
  fetchVendorsByBusinessType,
  fetchUserVendors,
  fetchVendorStats,
} from "@/lib/vendorApi";
import { VendorFilters } from "@/types/vendor";
import { authAPI } from "@/lib/auth-api";

export function useVendors(
  filters: VendorFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["vendors", filters],
    queryFn: () => fetchVendors(filters),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useVendorById(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["vendor", id],
    queryFn: () => fetchVendorById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchVendors(
  query: string,
  filters: VendorFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["vendors", "search", query, filters],
    queryFn: () => searchVendors(query, filters),
    enabled: enabled && !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useVendorsByBusinessType(
  businessType: string,
  filters: VendorFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["vendors", "businessType", businessType, filters],
    queryFn: () => fetchVendorsByBusinessType(businessType, filters),
    enabled: enabled && !!businessType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserVendors(
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["userVendors", page, limit],
    queryFn: () => fetchUserVendors(page, limit),
    enabled: enabled && authAPI.hasTokens(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useVendorStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ["vendorStats"],
    queryFn: () => fetchVendorStats(),
    enabled: enabled && authAPI.hasTokens(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
