"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LocationUpdate,
  WorkerLocationResponse,
  CustomerLocationResponse,
  LocationTrackingState,
  LocationTrackingActions,
} from "@/types/locationTracking";
import {
  startLocationTracking,
  updateWorkerLocation,
  stopLocationTracking,
  getCustomerLocation,
} from "@/lib/locationTrackingApi";

export function useWorkerLocationTracking(
  assignmentId: number,
  enabled: boolean = true
): LocationTrackingState &
  LocationTrackingActions & {
    customerLocation: CustomerLocationResponse | null;
    isLoadingCustomerLocation: boolean;
    customerLocationError: string | null;
    getCustomerLocationData: () => Promise<void>;
    getCurrentWorkerLocation: () => Promise<void>;
  } {
  const [state, setState] = useState<LocationTrackingState>({
    isTracking: false,
    currentLocation: null,
    isLoading: false,
    error: null,
    lastUpdate: null,
  });

  const [customerLocation, setCustomerLocation] =
    useState<CustomerLocationResponse | null>(null);
  const [isLoadingCustomerLocation, setIsLoadingCustomerLocation] =
    useState(false);
  const [customerLocationError, setCustomerLocationError] = useState<
    string | null
  >(null);

  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Start location tracking
  const startTracking = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await startLocationTracking(assignmentId);

      setState((prev) => ({
        ...prev,
        isTracking: true,
        isLoading: false,
        error: null,
      }));

      // Start periodic location updates (every 30 seconds)
      locationUpdateInterval.current = setInterval(async () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const location: LocationUpdate = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              };

              try {
                await updateWorkerLocation(assignmentId, location);
                setState((prev) => ({
                  ...prev,
                  lastUpdate: new Date(),
                  error: null,
                }));
              } catch (error) {
                console.error("Failed to update location:", error);
                setState((prev) => ({
                  ...prev,
                  error: "Failed to update location",
                }));
              }
            },
            (error) => {
              console.error("Geolocation error:", error);
              setState((prev) => ({
                ...prev,
                error: "Failed to get current location",
              }));
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000,
            }
          );
        }
      }, 30000); // 30 seconds
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to start tracking",
      }));
    }
  }, [assignmentId]);

  // Stop location tracking
  const stopTracking = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await stopLocationTracking(assignmentId);

      setState((prev) => ({
        ...prev,
        isTracking: false,
        isLoading: false,
        error: null,
      }));

      // Clear the interval
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
        locationUpdateInterval.current = null;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to stop tracking",
      }));
    }
  }, [assignmentId]);

  // Update location manually
  const updateLocation = useCallback(
    async (assignmentId: number, location: LocationUpdate) => {
      try {
        await updateWorkerLocation(assignmentId, location);
        setState((prev) => ({
          ...prev,
          lastUpdate: new Date(),
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update location",
        }));
      }
    },
    []
  );

  // Get customer location
  const getCustomerLocationData = useCallback(async () => {
    try {
      setIsLoadingCustomerLocation(true);
      setCustomerLocationError(null);

      const location = await getCustomerLocation(assignmentId);
      setCustomerLocation(location);
    } catch (error) {
      setCustomerLocationError(
        error instanceof Error
          ? error.message
          : "Failed to get customer location"
      );
    } finally {
      setIsLoadingCustomerLocation(false);
    }
  }, [assignmentId]);

  // Get current worker location
  const getCurrentWorkerLocation = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Get current GPS position
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000,
            });
          }
        );

        const location: LocationUpdate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        // Update location in backend
        await updateWorkerLocation(assignmentId, location);

        // Create a mock worker location response for display
        const workerLocation: WorkerLocationResponse = {
          worker_id: 0, // Will be set by backend
          assignment_id: assignmentId,
          booking_id: 0, // Will be set by backend
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          status: "tracking",
          last_updated: new Date().toISOString(),
          distance: 0, // Will be calculated by backend
          eta: 0, // Will be calculated by backend
        };

        setState((prev) => ({
          ...prev,
          currentLocation: workerLocation,
          lastUpdate: new Date(),
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error("Geolocation is not supported by this browser");
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get current location",
      }));
    }
  }, [assignmentId, updateLocation]);

  // Initialize location tracking
  useEffect(() => {
    if (!enabled || !assignmentId) return;

    // Get customer location when component mounts
    getCustomerLocationData();

    return () => {
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, [enabled, assignmentId, getCustomerLocationData]);

  return {
    ...state,
    startTracking,
    updateLocation,
    stopTracking,
    customerLocation,
    isLoadingCustomerLocation,
    customerLocationError,
    getCustomerLocationData,
    getCurrentWorkerLocation,
  };
}
