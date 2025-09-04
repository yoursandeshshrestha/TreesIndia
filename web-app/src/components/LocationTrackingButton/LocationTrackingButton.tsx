"use client";

import React, { useEffect, useState } from "react";
import { MapPin, MapPinOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  startLocationTracking,
  stopLocationTracking,
  connectToWebSocket,
  disconnectFromWebSocket,
} from "@/store/slices/locationTrackingSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { WorkerAssignment } from "@/lib/workerAssignmentApi";
import { useAuth } from "@/contexts/AuthContext";

interface LocationTrackingButtonProps {
  assignment: WorkerAssignment;
  userId: number;
  className?: string;
}

export function LocationTrackingButton({
  assignment,
  userId,
  className = "",
}: LocationTrackingButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const { isConnected, isTracking, currentAssignmentId, error } = useSelector(
    (state: RootState) => state.locationTracking
  );

  const isCurrentlyTracking =
    isTracking && currentAssignmentId === assignment.ID;
  const canTrack = assignment.status === "in_progress";

  useEffect(() => {
      assignmentId: assignment.ID,
      bookingId: assignment.booking_id,
      userId,
      isConnected,
      isConnecting,
      currentAssignmentId,
    });

    // Auto-connect to WebSocket when component mounts
    if (!isConnected && !isConnecting) {
      setIsConnecting(true);
      dispatch(
        connectToWebSocket({
          userId,
          roomId: assignment.booking_id,
          userType: (user?.user_type as "worker" | "user") || "worker",
        })
      ).finally(() => setIsConnecting(false));
    }

    // Cleanup on unmount
    return () => {
      if (isConnected && currentAssignmentId === assignment.ID) {
        dispatch(stopLocationTracking(assignment.ID));
      }
    };
  }, [
    dispatch,
    userId,
    assignment.booking_id,
    assignment.ID,
    isConnected,
    isConnecting,
    currentAssignmentId,
  ]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleStartTracking = async () => {
      "[LocationTrackingButton] Starting tracking for assignment:",
      assignment.ID
    );

    if (!isConnected) {
      console.error("[LocationTrackingButton] Not connected to WebSocket");
      toast.error("Not connected to location service");
      return;
    }

    try {
      await dispatch(startLocationTracking(assignment.ID)).unwrap();
        "[LocationTrackingButton] Location tracking started successfully"
      );
      toast.success("Location tracking started");
    } catch (error) {
      console.error(
        "[LocationTrackingButton] Failed to start location tracking:",
        error
      );
      toast.error("Failed to start location tracking");
    }
  };

  const handleStopTracking = async () => {
      "[LocationTrackingButton] Stopping tracking for assignment:",
      assignment.ID
    );

    try {
      await dispatch(stopLocationTracking(assignment.ID)).unwrap();
        "[LocationTrackingButton] Location tracking stopped successfully"
      );
      toast.success("Location tracking stopped");
    } catch (error) {
      console.error(
        "[LocationTrackingButton] Failed to stop location tracking:",
        error
      );
      toast.error("Failed to stop location tracking");
    }
  };

  if (!canTrack) {
    return null; // Don't show button if assignment is not in progress
  }

  if (isConnecting) {
    return (
      <button
        disabled
        className={`w-full px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed ${className}`}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          Connecting...
        </div>
      </button>
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={() => {
          setIsConnecting(true);
          dispatch(
            connectToWebSocket({
              userId,
              roomId: assignment.booking_id,
              userType: (user?.user_type as "worker" | "user") || "worker",
            })
          ).finally(() => setIsConnecting(false));
        }}
        className={`w-full px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors ${className}`}
      >
        <div className="flex items-center justify-center gap-2">
          <MapPinOff className="w-4 h-4" />
          Reconnect
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={isCurrentlyTracking ? handleStopTracking : handleStartTracking}
      className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isCurrentlyTracking
          ? "text-white bg-red-600 hover:bg-red-700"
          : "text-white bg-green-600 hover:bg-green-700"
      } ${className}`}
    >
      <div className="flex items-center justify-center gap-2">
        {isCurrentlyTracking ? (
          <>
            <MapPinOff className="w-4 h-4" />
            Stop Tracking
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Start Tracking
          </>
        )}
      </div>
    </button>
  );
}
