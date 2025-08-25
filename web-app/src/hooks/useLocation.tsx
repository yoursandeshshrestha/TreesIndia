"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAppDispatch } from "@/store/hooks";
import { openLocationModal } from "@/store/slices/locationModalSlice";

interface Location {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationContextType {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  setLocation: (location: Location) => void;
  detectLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to get location from IP (free service)
      const ipResponse = await fetch("https://ipapi.co/json/");
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        const detectedLocation: Location = {
          city: ipData.city || "Unknown City",
          state: ipData.region || "Unknown State",
          country: ipData.country_name || "Unknown Country",
        };

        setLocation(detectedLocation);
        localStorage.setItem("userLocation", JSON.stringify(detectedLocation));
        setIsLoading(false);
        return;
      }
    } catch (ipError) {
      console.error("IP-based location detection failed:", ipError);
    }

    // Fallback: try browser geolocation
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Use a free reverse geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address;

        const detectedLocation: Location = {
          city:
            address.city || address.town || address.village || "Unknown City",
          state: address.state || "Unknown State",
          country: address.country || "Unknown Country",
          coordinates: {
            lat: latitude,
            lng: longitude,
          },
        };

        setLocation(detectedLocation);
        localStorage.setItem("userLocation", JSON.stringify(detectedLocation));
      } else {
        throw new Error("Failed to get location details");
      }
    } catch (err) {
      console.error("Location detection error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to detect location. Please enter your location manually."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setLocation(parsedLocation);
      } catch (err) {
        console.error("Failed to parse saved location:", err);
        localStorage.removeItem("userLocation");
        // Show location modal if saved location is invalid
        dispatch(openLocationModal());
      }
    } else {
      // Show location modal if no saved location
      dispatch(openLocationModal());
    }
  }, [dispatch]);

  const value: LocationContextType = {
    location,
    isLoading,
    error,
    setLocation,
    detectLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
