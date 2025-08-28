import { useQuery } from "@tanstack/react-query";
import { heroApi } from "@/lib/heroApi";

export function useHeroConfig() {
  return useQuery({
    queryKey: ["heroConfig"],
    queryFn: () => heroApi.getHeroConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useCategoryIcons() {
  return useQuery({
    queryKey: ["categoryIcons"],
    queryFn: () => heroApi.getCategoryIcons(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useHeroImages() {
  return useQuery({
    queryKey: ["heroImages"],
    queryFn: () => heroApi.getHeroImages(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
