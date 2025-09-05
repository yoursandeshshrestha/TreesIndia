"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setLocation,
  setLocationLoading,
  setLocationError,
} from "@/store/slices/locationSlice";
import { openLocationModal } from "@/store/slices/locationModalSlice";

// Import the fetch functions directly
async function fetchReverseGeocode(latitude: number, longitude: number) {
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
          postal_code: result.postcode || result.postal_code || "",
          address:
            result.formatted_address ||
            result.address_line1 ||
            result.address_line2 ||
            "",
          coordinates: {
            lat: latitude,
            lng: longitude,
          },
        };
      }
    }
  } catch {
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
    postal_code: address.postcode || "",
    address: data.display_name || "",
    coordinates: {
      lat: latitude,
      lng: longitude,
    },
  };
}

async function fetchIPLocation() {
  const response = await fetch("https://ipapi.co/json/");

  if (!response.ok) {
    throw new Error("Failed to fetch IP location");
  }

  const data = await response.json();

  return {
    city: data.city || "Unknown City",
    state: data.region || "Unknown State",
    country: data.country_name || "Unknown Country",
    postal_code: data.postal || "",
    address: `${data.city || ""}, ${data.region || ""}, ${
      data.country_name || ""
    }`,
  };
}

interface Location {
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export function useLocation() {
  const dispatch = useAppDispatch();
  const { location, isLoading, error } = useAppSelector(
    (state) => state.location
  );

  const detectLocation = async (): Promise<Location | null> => {
    dispatch(setLocationLoading(true));
    dispatch(setLocationError(null));

    try {
      // First try browser geolocation (GPS coordinates) for accurate location
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000, // 5 minutes cache
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Use the reverse geocoding function directly
      const detectedLocation = await fetchReverseGeocode(latitude, longitude);

      dispatch(setLocation(detectedLocation));
      localStorage.setItem("userLocation", JSON.stringify(detectedLocation));
      dispatch(setLocationLoading(false));
      return detectedLocation;
    } catch (gpsError) {
      // Fallback: try to get location from IP (less accurate but available)
      try {
        const detectedLocation = await fetchIPLocation();
        dispatch(setLocation(detectedLocation));
        localStorage.setItem("userLocation", JSON.stringify(detectedLocation));
        dispatch(setLocationLoading(false));
        return detectedLocation;
      } catch {
        // IP-based location detection also failed
      }

      // If both methods fail, show error
      let errorMessage =
        "Failed to detect location. Please enter your location manually.";

      if (gpsError instanceof Error) {
        if (gpsError.message.includes("denied")) {
          errorMessage =
            "Location access denied. Please allow location access or search for your location manually.";
        } else if (gpsError.message.includes("timeout")) {
          errorMessage =
            "Location detection timed out. Please try again or search for your location manually.";
        } else if (gpsError.message.includes("not supported")) {
          errorMessage =
            "Location detection not supported. Please search for your location manually.";
        } else {
          errorMessage = gpsError.message;
        }
      }

      dispatch(setLocationError(errorMessage));
      dispatch(setLocationLoading(false));
    }

    return null;
  };

  const setLocationData = (locationData: Location) => {
    dispatch(setLocation(locationData));
    localStorage.setItem("userLocation", JSON.stringify(locationData));
  };

  const setError = (errorMessage: string | null) => {
    dispatch(setLocationError(errorMessage));
  };

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        dispatch(setLocation(parsedLocation));
      } catch {
        localStorage.removeItem("userLocation");
        // Show location modal if saved location is invalid
        dispatch(openLocationModal());
      }
    } else {
      // Show location modal if no saved location
      dispatch(openLocationModal());
    }
  }, [dispatch]);

  return {
    location,
    isLoading,
    error,
    setLocation: setLocationData,
    setError,
    detectLocation,
  };
}
