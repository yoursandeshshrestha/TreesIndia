"use client";

import { useState, useEffect } from "react";

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface UseCurrentUserLocationReturn {
  userLocation: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  getUserLocation: () => Promise<void>;
}

export function useCurrentUserLocation(): UseCurrentUserLocationReturn {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000, // 5 minutes cache
          });
        }
      );

      const { latitude, longitude, accuracy } = position.coords;

      setUserLocation({
        latitude,
        longitude,
        accuracy,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get location";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  return {
    userLocation,
    isLoading,
    error,
    getUserLocation,
  };
}
