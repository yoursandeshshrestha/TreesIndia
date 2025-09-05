"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import type { WorkerLocation } from "@/types/location-tracking";

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

// Import Leaflet for icon creation and map manipulation
let L: typeof import("leaflet") | undefined;
if (typeof window !== "undefined") {
  import("leaflet")
    .then((leaflet) => {
      L = leaflet;
    })
    .catch((error) => {
      console.warn("Leaflet not available:", error);
    });
}

interface CustomerLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface LocationMapProps {
  customerLocation: CustomerLocation | null;
  workerLocation: WorkerLocation | null;
  distance: number | null;
  isClient: boolean;
  isLoading: boolean;
}

export function LocationMap({
  customerLocation,
  workerLocation,
  distance,
  isClient,
  isLoading,
}: LocationMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    20.5937,
    78.9629, // Default: India center
  ]);
  const [mapZoom] = useState(13);
  const mapRef = useRef<L.Map | null>(null);

  // Update map center when customer location is available
  useEffect(() => {
    if (customerLocation) {
      setMapCenter([customerLocation.latitude, customerLocation.longitude]);
    }
  }, [customerLocation]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  // Calculate map bounds to fit both locations
  const calculateMapBounds = useCallback(
    (customer: CustomerLocation, worker: WorkerLocation): MapBounds => {
      const padding = 0.01; // Add padding around markers
      return {
        north: Math.max(customer.latitude, worker.latitude) + padding,
        south: Math.min(customer.latitude, worker.latitude) - padding,
        east: Math.max(customer.longitude, worker.longitude) + padding,
        west: Math.min(customer.longitude, worker.longitude) - padding,
      };
    },
    []
  );

  // Fit map to show both locations
  const fitMapToLocations = useCallback(() => {
    if (mapRef.current && customerLocation && workerLocation) {
      const bounds = calculateMapBounds(customerLocation, workerLocation);
      const map = mapRef.current;

      if (map && map.fitBounds) {
        map.fitBounds(
          [
            [bounds.south, bounds.west],
            [bounds.north, bounds.east],
          ],
          { padding: [20, 20] }
        );
      }
    }
  }, [customerLocation, workerLocation, calculateMapBounds]);

  // Calculate zoom level based on distance
  const getZoomLevel = useCallback((distance: number): number => {
    if (distance < 0.1) return 18; // Very close - street level
    if (distance < 0.5) return 16; // Close - neighborhood level
    if (distance < 1) return 14; // Medium - city block level
    if (distance < 5) return 12; // Far - district level
    if (distance < 20) return 10; // Very far - city level
    return 8; // Extremely far - regional level
  }, []);

  // Fit map when both locations are available
  useEffect(() => {
    if (
      customerLocation &&
      workerLocation &&
      workerLocation.latitude &&
      workerLocation.longitude
    ) {
      // Calculate distance and zoom level
      const calculatedDistance = calculateDistance(
        customerLocation.latitude,
        customerLocation.longitude,
        workerLocation.latitude,
        workerLocation.longitude
      );

      const zoomLevel = getZoomLevel(calculatedDistance);

      // Small delay to ensure map is fully rendered
      setTimeout(() => {
        if (calculatedDistance < 0.1) {
          // Very close - just center on worker location
          mapRef.current?.setView(
            [workerLocation.latitude, workerLocation.longitude],
            zoomLevel
          );
        } else {
          // Use fitBounds for better view of both locations
          fitMapToLocations();
        }
      }, 100);
    } else if (customerLocation) {
      // If only customer location is available, center on customer with appropriate zoom
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setView(
            [customerLocation.latitude, customerLocation.longitude],
            16 // Higher zoom level for user location when worker is not available
          );
        }
      }, 200); // Increased delay to ensure map is ready
    } else if (
      workerLocation &&
      workerLocation.latitude &&
      workerLocation.longitude
    ) {
      // If only worker location is available, center on worker
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setView(
            [workerLocation.latitude, workerLocation.longitude],
            15
          );
        }
      }, 200);
    }
  }, [
    customerLocation,
    workerLocation,
    fitMapToLocations,
    calculateDistance,
    getZoomLevel,
  ]);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        ref={mapRef}
        whenReady={() => {
          // Trigger a re-evaluation of location when map is ready
          if (customerLocation && !workerLocation) {
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.setView(
                  [customerLocation.latitude, customerLocation.longitude],
                  16
                );
              }
            }, 100);
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Customer Location Marker - Always Visible Blue Circle */}
        {customerLocation && (
          <Marker
            position={[customerLocation.latitude, customerLocation.longitude]}
            icon={
              L && L.divIcon
                ? L.divIcon({
                    className: "custom-div-icon",
                    html: `<svg width="40" height="40" viewBox="0 0 24 24" style="filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4));">
                        <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                        <circle cx="10" cy="10" r="4" fill="white" opacity="0.9"/>
                      </svg>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  })
                : undefined
            }
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-blue-600">Your Location</div>
                <div className="text-xs text-gray-500 mt-1">
                  {customerLocation.latitude.toFixed(6)},{" "}
                  {customerLocation.longitude.toFixed(6)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {customerLocation.address}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Worker Location Marker - Simple Red Circle with Pulse */}
        {workerLocation &&
          workerLocation.latitude &&
          workerLocation.longitude && (
            <Marker
              position={[workerLocation.latitude, workerLocation.longitude]}
              icon={
                L && L.divIcon
                  ? L.divIcon({
                      className: "custom-div-icon",
                      html: `<svg width="20" height="20" viewBox="0 0 20 20" style="filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.4));">
                      <circle cx="10" cy="10" r="8" fill="#EF4444" stroke="white" stroke-width="2"/>
                      <circle cx="10" cy="10" r="4" fill="white" opacity="0.2"/>
                    </svg>`,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10],
                    })
                  : undefined
              }
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-red-600">
                    Worker Location
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {workerLocation.latitude?.toFixed(6) || "N/A"},{" "}
                    {workerLocation.longitude?.toFixed(6) || "N/A"}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
      </MapContainer>

      {/* Distance overlay */}
      {distance !== null && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="text-sm font-medium text-gray-700">
            Distance:{" "}
            <span className="text-blue-600">{distance.toFixed(2)} km</span>
          </div>
        </div>
      )}
    </div>
  );
}
