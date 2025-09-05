import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { locationTrackingWebSocket } from "@/services/websocketService";
import {
  updateLocation,
  updateTrackingStatus,
  setConnectionStatus,
  setError,
} from "@/store/slices/locationTrackingSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type {
  WorkerLocation,
  TrackingStatus,
  TrackingStatusResponse,
} from "@/types/location-tracking";

export function useLocationTracking() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    isConnected,
    isTracking,
    currentAssignmentId,
    trackingStatuses,
    lastKnownLocations,
  } = useSelector((state: RootState) => state.locationTracking);

  // Handle WebSocket callbacks
  const handleLocationUpdate = useCallback(
    (location: WorkerLocation) => {
      console.log(
        "[useLocationTracking] handleLocationUpdate called",
        location
      );
      dispatch(updateLocation(location));
    },
    [dispatch]
  );

  const handleTrackingStatus = useCallback(
    (data: { tracking_status: TrackingStatusResponse }) => {
      if (data.tracking_status) {
        // Transform TrackingStatusResponse to TrackingStatus
        const transformedStatus: TrackingStatus = {
          assignmentId: data.tracking_status.assignment_id,
          isTracking: data.tracking_status.is_tracking,
          trackingStartedAt:
            data.tracking_status.tracking_started_at || undefined,
        };

        console.log("Received tracking status:", transformedStatus);

        dispatch(
          updateTrackingStatus({
            assignmentId: transformedStatus.assignmentId,
            status: transformedStatus,
          })
        );
      }
    },
    [dispatch]
  );

  const handleConnected = useCallback(() => {
    dispatch(setConnectionStatus(true));
  }, [dispatch]);

  const handleDisconnected = useCallback(() => {
    dispatch(setConnectionStatus(false));
  }, [dispatch]);

  const handleError = useCallback(
    (error: string) => {
      dispatch(setError(error));
    },
    [dispatch]
  );

  // Setup WebSocket callbacks when component mounts
  useEffect(() => {
    console.log("[useLocationTracking] Setting up WebSocket callbacks");
    if (locationTrackingWebSocket) {
      // Set up callbacks
      locationTrackingWebSocket.setupCallbacks({
        onLocationUpdate: handleLocationUpdate,
        onTrackingStatus: handleTrackingStatus,
        onConnected: handleConnected,
        onDisconnected: handleDisconnected,
        onError: handleError,
        onWorkerLocationUpdate: handleLocationUpdate, // For customers
        onMyLocationUpdate: handleLocationUpdate, // For workers
      });
      console.log(
        "[useLocationTracking] WebSocket callbacks set up successfully"
      );
    } else {
      console.error("[useLocationTracking] locationTrackingWebSocket is null");
    }

    // Cleanup on unmount
    return () => {
      console.log("[useLocationTracking] Cleaning up WebSocket callbacks");
      if (locationTrackingWebSocket) {
        locationTrackingWebSocket.disconnect();
      }
    };
  }, [
    handleLocationUpdate,
    handleTrackingStatus,
    handleConnected,
    handleDisconnected,
    handleError,
  ]);

  // Connect to WebSocket
  const connectToWebSocket = useCallback(
    ({
      userId,
      roomId,
      userType,
    }: {
      userId: number;
      roomId: number;
      userType: "worker" | "normal" | "admin";
    }) => {
      if (locationTrackingWebSocket) {
        console.log("[useLocationTracking] Connecting to WebSocket", {
          userId,
          roomId,
          userType,
        });
        locationTrackingWebSocket.connect(userId, roomId, userType, {
          onLocationUpdate: handleLocationUpdate,
          onTrackingStatus: handleTrackingStatus,
          onConnected: handleConnected,
          onDisconnected: handleDisconnected,
          onError: handleError,
          onWorkerLocationUpdate: handleLocationUpdate, // For customers
          onMyLocationUpdate: handleLocationUpdate, // For workers
        });
      }
    },
    [
      handleLocationUpdate,
      handleTrackingStatus,
      handleConnected,
      handleDisconnected,
      handleError,
    ]
  );

  // Start location tracking
  const startLocationTracking = useCallback((assignmentId: number) => {
    if (locationTrackingWebSocket) {
      locationTrackingWebSocket.startLocationTracking(assignmentId);
    }
  }, []);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (locationTrackingWebSocket) {
      locationTrackingWebSocket.stopLocationTracking();
    }
  }, []);

  // Disconnect from WebSocket
  const disconnectFromWebSocket = useCallback(() => {
    if (locationTrackingWebSocket) {
      locationTrackingWebSocket.disconnect();
    }
  }, []);

  // Get tracking status for a specific assignment
  const getTrackingStatus = useCallback(
    (assignmentId: number): TrackingStatus | undefined => {
      return trackingStatuses[assignmentId];
    },
    [trackingStatuses]
  );

  // Get last known location for a specific assignment
  const getLastKnownLocation = useCallback(
    (assignmentId: number): WorkerLocation | undefined => {
      return lastKnownLocations[assignmentId];
    },
    [lastKnownLocations]
  );

  // Check if a specific assignment is being tracked
  const isAssignmentTracked = useCallback(
    (assignmentId: number): boolean => {
      return isTracking && currentAssignmentId === assignmentId;
    },
    [isTracking, currentAssignmentId]
  );

  return {
    isConnected,
    isTracking,
    currentAssignmentId,
    connectToWebSocket,
    startLocationTracking,
    stopLocationTracking,
    disconnectFromWebSocket,
    getTrackingStatus,
    getLastKnownLocation,
    isAssignmentTracked,
  };
}
