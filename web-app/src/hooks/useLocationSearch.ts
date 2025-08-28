import { useQuery } from "@tanstack/react-query";

interface LocationSearchResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  formatted: string;
}

interface UseLocationSearchOptions {
  query: string;
  enabled?: boolean;
}

async function fetchLocationSearch(
  query: string
): Promise<LocationSearchResult[]> {
  if (query.length < 2) {
    return [];
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const response = await fetch(
    `${apiUrl}/places/autocomplete?input=${encodeURIComponent(query)}&limit=5`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location search results");
  }

  const data = await response.json();
  if (data.success && data.data?.predictions) {
    return data.data.predictions;
  }

  return [];
}

export function useLocationSearch({
  query,
  enabled = true,
}: UseLocationSearchOptions) {
  return useQuery({
    queryKey: ["locationSearch", query],
    queryFn: () => fetchLocationSearch(query),
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
