"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { WorkerLocationResponse } from "@/types/locationTracking";
import { useCurrentUserLocation } from "@/hooks/useCurrentUserLocation";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "./LocationTracking.css";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface WorkerLocationMapProps {
  workerLocation: WorkerLocationResponse | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  className?: string;
}

export default function WorkerLocationMap({
  workerLocation,
  isLoading,
  error,
  lastUpdate,
  className = "",
}: WorkerLocationMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  // Get current user location
  const {
    userLocation,
    isLoading: isLoadingUserLocation,
    error: userLocationError,
  } = useCurrentUserLocation();

  // Default center (Siliguri, West Bengal)
  const defaultCenter: [number, number] = [26.7271, 88.3953];

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((leaflet) => {
        setL(leaflet.default);
      });
    }
  }, []);

  // Set coordinates for map (worker + user if available)
  useEffect(() => {
    const coordinates: [number, number][] = [];

    if (workerLocation) {
      coordinates.push([workerLocation.latitude, workerLocation.longitude]);
    }

    if (userLocation) {
      coordinates.push([userLocation.latitude, userLocation.longitude]);
    }

    setRouteCoordinates(coordinates);
  }, [workerLocation, userLocation]);

  // Calculate map center based on available locations
  const getMapCenter = (): [number, number] => {
    if (workerLocation && userLocation) {
      // Center between worker and user
      return [
        (workerLocation.latitude + userLocation.latitude) / 2,
        (workerLocation.longitude + userLocation.longitude) / 2,
      ];
    } else if (workerLocation) {
      return [workerLocation.latitude, workerLocation.longitude];
    } else if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }
    return defaultCenter;
  };

  // Calculate dynamic zoom based on distance between locations
  const getDynamicZoom = (): number => {
    if (!workerLocation || !userLocation) {
      return 13; // Default zoom when only one location is available
    }

    // Calculate distance between worker and user
    const latDiff = Math.abs(workerLocation.latitude - userLocation.latitude);
    const lngDiff = Math.abs(workerLocation.longitude - userLocation.longitude);
    const maxDiff = Math.max(latDiff, lngDiff);

    // Adjust zoom based on distance
    if (maxDiff < 0.001) return 18; // Very close: high zoom
    if (maxDiff < 0.01) return 16; // Close: medium-high zoom
    if (maxDiff < 0.1) return 14; // Medium: medium zoom
    if (maxDiff < 0.5) return 12; // Far: medium-low zoom
    if (maxDiff < 1.0) return 10; // Very far: low zoom
    return 8; // Extremely far: very low zoom
  };

  // Update map view when coordinates change with smooth animation
  useEffect(() => {
    if (mapRef.current && routeCoordinates.length > 0) {
      const center = getMapCenter();
      const zoom = getDynamicZoom();

      // Use the map instance to update view with smooth animation
      const map = mapRef.current;
      if (map && typeof map.setView === "function") {
        map.setView(center, zoom, {
          animate: true,
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    }
  }, [routeCoordinates, workerLocation, userLocation]);

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}
      >
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Location Error
        </h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Container */}
      <div className="relative">
        <div className="w-full h-80 rounded-lg border border-gray-200 overflow-hidden">
          {typeof window !== "undefined" && L ? (
            <MapContainer
              center={getMapCenter()}
              zoom={getDynamicZoom()}
              className="w-full h-full"
              style={{ height: "320px" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Worker Marker */}
              {workerLocation && (
                <Marker
                  position={[workerLocation.latitude, workerLocation.longitude]}
                  icon={L.divIcon({
                    className: "custom-worker-marker",
                    html: `
                      <div style="
                        width: 32px; 
                        height: 32px; 
                        background: #00a871; 
                        border: 3px solid white; 
                        border-radius: 50%; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                      ">
                        <div style="
                          width: 16px; 
                          height: 16px; 
                          background: white; 
                          border-radius: 50%;
                        "></div>
                      </div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{workerLocation.worker_name || "Worker"}</strong>
                      <br />
                      <small>Current Location</small>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Current User Marker */}
              {userLocation && (
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={L.divIcon({
                    className: "custom-user-marker",
                    html: `
                      <div style="
                        width: 24px; 
                        height: 24px; 
                        background: #3b82f6; 
                        border: 2px solid white; 
                        border-radius: 50%; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                      ">
                        <div style="
                          width: 8px; 
                          height: 8px; 
                          background: white; 
                          border-radius: 50%;
                        "></div>
                      </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Your Location</strong>
                      <br />
                      <small>Current Position</small>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Route Line - Show line between worker and user if both are available */}
              {routeCoordinates.length > 1 && (
                <Polyline
                  positions={routeCoordinates}
                  color="#00a871"
                  weight={3}
                  opacity={0.7}
                />
              )}
            </MapContainer>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a871] mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a871] mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading location...</p>
            </div>
          </div>
        )}
      </div>

      {/* No Location State */}
      {!workerLocation && !userLocation && !isLoading && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Location Available
          </h3>
          <p className="text-gray-600">
            Worker location will appear here when they start the assignment.
          </p>
        </div>
      )}

      {/* Arrival Status */}
      {workerLocation?.has_arrived && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-semibold">
              {workerLocation.worker_name || "Worker"} has arrived at your
              location!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
