import { useQuery } from "@tanstack/react-query";

interface Location {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface UseReverseGeocodeOptions {
  latitude: number;
  longitude: number;
  enabled?: boolean;
}

async function fetchReverseGeocode(
  latitude: number,
  longitude: number
): Promise<Location> {
  // Try backend geocoding service first (more reliable)
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const backendResponse = await fetch(
      `${apiUrl}/places/reverse-geocode?latitude=${latitude}&longitude=${longitude}`
    );

    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      if (backendData.success && backendData.data?.results?.length > 0) {
        const result = backendData.data.results[0];
        return {
          city: result.city || result.locality || "Unknown City",
          state: result.state || result.region || "Unknown State",
          country: result.country || "Unknown Country",
          coordinates: {
            lat: latitude,
            lng: longitude,
          },
        };
      }
    }
  } catch (backendError) {
    // Backend geocoding failed, trying Nominatim
  }

  // Fallback to Nominatim reverse geocoding
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
  );

  if (!response.ok) {
    throw new Error("Failed to get location details from coordinates");
  }

  const data = await response.json();
  const address = data.address;

  // Enhanced city extraction logic
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.suburb ||
    address.county ||
    address.municipality ||
    address.district ||
    address.locality ||
    address.neighbourhood ||
    address.postcode ||
    "Unknown City";

  const state =
    address.state ||
    address.province ||
    address.region ||
    address.county ||
    "Unknown State";

  return {
    city,
    state,
    country: address.country || "Unknown Country",
    coordinates: {
      lat: latitude,
      lng: longitude,
    },
  };
}

export function useReverseGeocode({
  latitude,
  longitude,
  enabled = true,
}: UseReverseGeocodeOptions) {
  return useQuery({
    queryKey: ["reverseGeocode", latitude, longitude],
    queryFn: () => fetchReverseGeocode(latitude, longitude),
    enabled: enabled && latitude !== 0 && longitude !== 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
