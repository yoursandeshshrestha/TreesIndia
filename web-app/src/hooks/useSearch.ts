import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchService, SearchParams } from "../services/searchService";

// Query keys
export const searchKeys = {
  all: ["search"] as const,
  suggestions: () => [...searchKeys.all, "suggestions"] as const,
  services: (params: SearchParams) =>
    [...searchKeys.all, "services", params] as const,
};

/**
 * Hook to get search suggestions
 */
export function useSearchSuggestions(enabled: boolean = true) {
  return useQuery({
    queryKey: searchKeys.suggestions(),
    queryFn: searchService.getSuggestions,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to search services with debounced query
 */
export function useSearchServices(
  params: SearchParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: searchKeys.services(params),
    queryFn: () => searchService.searchServices(params),
    enabled: enabled && params.q.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to prefetch search suggestions
 */
export function usePrefetchSearchSuggestions() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: searchKeys.suggestions(),
      queryFn: searchService.getSuggestions,
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook to invalidate search cache
 */
export function useInvalidateSearch() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: searchKeys.all,
    });
  };
}
