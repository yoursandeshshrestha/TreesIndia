"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import type { WorkerAssignment } from "@/lib/workerAssignmentApi";
import type { WorkerLocation } from "@/types/location-tracking";
import { locationTrackingWebSocket } from "@/services/websocketService";
import { useBookingChatRoom } from "@/hooks/useChat";
import { LocationMap } from "./LocationMap";
import { RealTimeChat } from "./RealTimeChat";

interface LocationTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: WorkerAssignment;
  booking?: unknown;
}

interface CustomerLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export function LocationTrackingModal({
  isOpen,
  onClose,
  assignment,
}: LocationTrackingModalProps) {
  // Get chat room for this booking
  const { data: bookingChatRoomData } = useBookingChatRoom(
    assignment.booking_id
  );

  const chatRoom = bookingChatRoomData?.chat_room;

  // Add CSS for pulsing animation
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes customerPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.9; }
        100% { transform: scale(1); opacity: 1; }
      }
      .worker-marker {
        animation: pulse 2s infinite;
      }
      .customer-marker {
        animation: customerPulse 3s infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const { user } = useAuth();
  const [customerLocation, setCustomerLocation] =
    useState<CustomerLocation | null>(null);
  const [workerLocation, setWorkerLocation] = useState<WorkerLocation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const workerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure we're on the client side to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Direct WebSocket connection management
  const connectToWebSocket = useCallback(() => {
    if (!user || !assignment?.booking_id) return;

    console.log("[LocationTrackingModal] Connecting to WebSocket", {
      userId: user.id,
      roomId: assignment.booking_id,
      userType: "user",
    });

    locationTrackingWebSocket.connect(
      user.id,
      assignment.booking_id,
      "normal",
      {
        onConnected: () => {
          console.log("[LocationTrackingModal] WebSocket connected");
          setConnectionError(null);
        },
        onDisconnected: () => {
          console.log("[LocationTrackingModal] WebSocket disconnected");
        },
        onError: (error: string) => {
          console.error("[LocationTrackingModal] WebSocket error:", error);
          setConnectionError(error);
        },
        onWorkerLocationUpdate: (location: WorkerLocation) => {
          console.log(
            "[LocationTrackingModal] Worker location update:",
            location
          );
          // Check if this location is for our assignment
          if (
            location.assignment_id === assignment.ID ||
            location.assignment_id === assignment.booking_id
          ) {
            setWorkerLocation(location);

            // Clear any existing timeout
            if (workerTimeoutRef.current) {
              clearTimeout(workerTimeoutRef.current);
            }

            // Set a timeout to clear worker location if no updates for 30 seconds
            workerTimeoutRef.current = setTimeout(() => {
              console.log(
                "[LocationTrackingModal] Worker location timeout - clearing location"
              );
              setWorkerLocation(null);
              setDistance(null);
            }, 30000); // 30 seconds timeout

            // Calculate distance if customer location is available
            if (customerLocation) {
              const calculatedDistance = calculateDistance(
                customerLocation.latitude,
                customerLocation.longitude,
                location.latitude,
                location.longitude
              );
              setDistance(calculatedDistance);
            }
          }
        },
        onWorkerLeave: (userId: number) => {
          console.log(
            "[LocationTrackingModal] Worker left:",
            userId,
            "Current worker location:",
            workerLocation
          );
          // Clear worker location when worker leaves
          if (workerLocation && workerLocation.worker_id === userId) {
            console.log("[LocationTrackingModal] Clearing worker location");
            setWorkerLocation(null);
            setDistance(null);
          }

          // Clear timeout when worker leaves
          if (workerTimeoutRef.current) {
            clearTimeout(workerTimeoutRef.current);
            workerTimeoutRef.current = null;
          }
        },
      }
    );
  }, [user, assignment, customerLocation, calculateDistance, workerLocation]);

  const disconnectFromWebSocket = useCallback(() => {
    console.log("[LocationTrackingModal] Disconnecting from WebSocket");
    locationTrackingWebSocket.disconnect();
    setConnectionError(null);

    // Clear timeout on disconnect
    if (workerTimeoutRef.current) {
      clearTimeout(workerTimeoutRef.current);
      workerTimeoutRef.current = null;
    }
  }, []);

  // Connect to WebSocket when modal opens
  useEffect(() => {
    if (isOpen && assignment && assignment.booking_id && user) {
      connectToWebSocket();
    }

    // Cleanup when modal closes
    return () => {
      if (isOpen) {
        disconnectFromWebSocket();
      }

      // Clear timeout on cleanup
      if (workerTimeoutRef.current) {
        clearTimeout(workerTimeoutRef.current);
        workerTimeoutRef.current = null;
      }
    };
  }, [isOpen, assignment, user, connectToWebSocket, disconnectFromWebSocket]);

  // Update distance when either location changes
  useEffect(() => {
    if (customerLocation && workerLocation) {
      const calculatedDistance = calculateDistance(
        customerLocation.latitude,
        customerLocation.longitude,
        workerLocation.latitude,
        workerLocation.longitude
      );
      setDistance(calculatedDistance);
    }
  }, [customerLocation, workerLocation, calculateDistance]);

  // Get user's current location and set up map
  useEffect(() => {
    const getUserLocation = async () => {
      // Always set a default location first to ensure marker is always visible
      const defaultLocation: CustomerLocation = {
        latitude: 20.5937,
        longitude: 78.9629,
        address: "Default Location (India Center)",
      };

      if (!navigator.geolocation) {
        console.error("Geolocation is not supported");
        setCustomerLocation(defaultLocation);
        setIsLoading(false);
        return;
      }

      try {
        // First try to get a cached position to avoid geolocation violation
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false, // Use lower accuracy for cached position
              timeout: 5000, // Shorter timeout
              maximumAge: 300000, // Allow positions up to 5 minutes old
            });
          }
        );

        const userLocation: CustomerLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: "Your Current Location",
        };

        setCustomerLocation(userLocation);

        // If worker location is already available, fit map to both locations
        if (workerLocation) {
          const calculatedDistance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            workerLocation.latitude,
            workerLocation.longitude
          );
          setDistance(calculatedDistance);
        }

        setIsLoading(false);
      } catch (error) {
        console.log(
          "No cached position available, using default location:",
          error
        );
        // Use default location if geolocation fails
        setCustomerLocation(defaultLocation);
        setIsLoading(false);
      }
    };

    getUserLocation();
  }, [workerLocation, calculateDistance]);

  if (!isOpen || !isClient) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className="relative"
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              onClick={onClose}
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-black" />
            </motion.button>

            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full min-w-[1200px] max-w-[95vw] h-[85vh] overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Split Layout: Map (Left) and Chat (Right) */}
              <div className="flex h-full">
                {/* Left Side - Map */}
                <div className="flex-1 flex flex-col">
                  {/* Map Header */}
                  <div className="bg-white px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            workerLocation ? "bg-red-600" : "bg-gray-400"
                          }`}
                        ></div>
                        <span>
                          Worker {workerLocation ? "(Online)" : "(Offline)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Map Container */}
                  <div className="flex-1 relative">
                    <LocationMap
                      customerLocation={customerLocation}
                      workerLocation={workerLocation}
                      distance={distance}
                      isClient={isClient}
                      isLoading={isLoading}
                    />
                  </div>
                </div>

                {/* Right Side - Chat */}
                <div className="w-96 border-l border-gray-200">
                  {chatRoom ? (
                    <RealTimeChat
                      roomId={chatRoom.id}
                      connectionError={connectionError}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm">Loading chat...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
