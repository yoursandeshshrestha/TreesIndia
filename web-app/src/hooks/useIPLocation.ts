import { useQuery } from "@tanstack/react-query";

interface Location {
  city: string;
  state: string;
  country: string;
}

interface IPLocationResponse {
  city: string;
  region: string;
  country_name: string;
}

async function fetchIPLocation(): Promise<Location> {
  const response = await fetch("https://ipapi.co/json/");

  if (!response.ok) {
    throw new Error("Failed to fetch IP location");
  }

  const data: IPLocationResponse = await response.json();

  return {
    city: data.city || "Unknown City",
    state: data.region || "Unknown State",
    country: data.country_name || "Unknown Country",
  };
}

export function useIPLocation(enabled: boolean = true) {
  return useQuery({
    queryKey: ["ipLocation"],
    queryFn: fetchIPLocation,
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}
