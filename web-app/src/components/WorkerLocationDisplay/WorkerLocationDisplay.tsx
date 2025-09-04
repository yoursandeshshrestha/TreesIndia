"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { WorkerLocation } from "@/types/location-tracking";

interface WorkerLocationDisplayProps {
  assignmentId: number;
  className?: string;
}

export function WorkerLocationDisplay({
  assignmentId,
  className = "",
}: WorkerLocationDisplayProps) {
  const [currentLocation, setCurrentLocation] = useState<WorkerLocation | null>(
    null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { lastKnownLocations, isTracking, currentAssignmentId } = useSelector(
    (state: RootState) => state.locationTracking
  );

  // Get location from Redux store
  useEffect(() => {
    const location = lastKnownLocations[assignmentId];
    if (location) {
      setCurrentLocation(location);
    }
  }, [lastKnownLocations, assignmentId]);

  // Get current location manually
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const newLocation: WorkerLocation = {
        worker_id: 0, // Will be set by the backend
        assignment_id: assignmentId,
        booking_id: 0, // Will be set by the backend
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        status: "active",
        last_updated: new Date().toISOString(),
      };

      setCurrentLocation(newLocation);
    } catch (error) {
      alert("Failed to get current location. Please check your GPS settings.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const isCurrentlyTracking =
    isTracking && currentAssignmentId === assignmentId;

  if (!currentLocation) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4 text-green-600" />
        <span className="font-medium">Current Location</span>
        {isCurrentlyTracking && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600">Live</span>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <div>
          <span className="font-medium">Latitude:</span>{" "}
          {currentLocation.latitude.toFixed(6)}
        </div>
        <div>
          <span className="font-medium">Longitude:</span>{" "}
          {currentLocation.longitude.toFixed(6)}
        </div>
        <div>
          <span className="font-medium">Accuracy:</span>{" "}
          {currentLocation.accuracy.toFixed(1)}m
        </div>
        <div>
          <span className="font-medium">Last Updated:</span>{" "}
          {new Date(currentLocation.last_updated).toLocaleTimeString()}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          <Navigation className="w-3 h-3" />
          {isGettingLocation ? "Updating..." : "Update Location"}
        </button>

        <a
          href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
        >
          <MapPin className="w-3 h-3" />
          View on Map
        </a>
      </div>
    </div>
  );
}
