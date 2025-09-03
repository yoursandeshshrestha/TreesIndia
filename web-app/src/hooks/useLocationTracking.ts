"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWebSocket, WebSocketMessage } from "./useWebSocket";
import {
  LocationUpdate,
  WorkerLocationResponse,
  LocationTrackingState,
  LocationTrackingActions,
} from "@/types/locationTracking";
import {
  startLocationTracking,
  updateWorkerLocation,
  stopLocationTracking,
  getWorkerLocation,
} from "@/lib/locationTrackingApi";

export function useLocationTracking(
  assignmentId: number,
  enabled: boolean = true,
  isWorkerUser: boolean = false
): LocationTrackingState & LocationTrackingActions {
  const [state, setState] = useState<LocationTrackingState>({
    isTracking: false,
    currentLocation: null,
    isLoading: false,
    error: null,
    lastUpdate: null,
  });

  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const isWorker = useRef<boolean>(isWorkerUser); // Track if this is worker or customer

  // WebSocket connection for real-time updates
  const { isConnected, connect, disconnect } = useWebSocket({
    roomId: assignmentId,
    enabled: enabled && !isWorker.current, // Only customers need WebSocket
    onMessage: (message: WebSocketMessage) => {
      if (message.type === "worker_location") {
        const locationData = message.data as WorkerLocationResponse;
        setState((prev) => ({
          ...prev,
          currentLocation: locationData,
          lastUpdate: new Date(),
          error: null,
        }));
      } else if (message.type === "tracking_stopped") {
        setState((prev) => ({
          ...prev,
          isTracking: false,
          currentLocation: null,
          error: null,
        }));
      }
    },
    onConnect: () => {
      console.log("Location tracking WebSocket connected");
    },
    onDisconnect: () => {
      console.log("Location tracking WebSocket disconnected");
    },
  });

  // Start location tracking (for workers)
  const startTracking = useCallback(async (assignmentId: number) => {
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
  }, []);

  // Update location manually (for workers)
  const updateLocation = useCallback(
    async (assignmentId: number, location: LocationUpdate) => {
      try {
        setState((prev) => ({ ...prev, error: null }));

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

  // Stop location tracking (for workers)
  const stopTracking = useCallback(async (assignmentId: number) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await stopLocationTracking(assignmentId);

      // Clear the interval
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
        locationUpdateInterval.current = null;
      }

      setState((prev) => ({
        ...prev,
        isTracking: false,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to stop tracking",
      }));
    }
  }, []);

  // Get worker location (for customers)
  const getWorkerLocationData = useCallback(async (assignmentId: number) => {
    try {
      console.log("🔍 Getting worker location for assignment:", assignmentId);
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const location = await getWorkerLocation(assignmentId);
      console.log("📍 Worker location received:", location);

      setState((prev) => ({
        ...prev,
        currentLocation: location,
        isLoading: false,
        error: null,
        lastUpdate: location ? new Date() : null,
      }));

      return location;
    } catch (error) {
      console.error("❌ Error getting worker location:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get worker location",
      }));
      return null;
    }
  }, []);

  // Initialize location tracking
  useEffect(() => {
    console.log("🚀 Location tracking hook initializing:", { enabled, assignmentId, isWorkerUser });
    if (!enabled || !assignmentId) {
      console.log("❌ Hook disabled or no assignment ID");
      return;
    }

    // Set worker status based on parameter
    isWorker.current = isWorkerUser;
    console.log("👤 User type set to:", isWorker.current ? "worker" : "customer");

    if (isWorker.current) {
      // Worker: Don't connect to WebSocket, just enable tracking functions
      // The tracking will be started manually when the worker clicks start
      console.log("Location tracking hook initialized for worker");
    } else {
      // Customer: Connect to WebSocket for real-time updates
      console.log("🔌 Connecting to WebSocket and getting initial location");
      connect();

      // Get initial location
      getWorkerLocationData(assignmentId);
    }

    return () => {
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
      disconnect();
    };
  }, [enabled, assignmentId, connect, disconnect, getWorkerLocationData, isWorkerUser]);

  return {
    ...state,
    startTracking,
    updateLocation,
    stopTracking,
    getWorkerLocation: getWorkerLocationData,
  };
}
