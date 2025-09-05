"use client";

import React, { useState } from "react";
import { MapPin, User, MessageCircle, Play, Square, Phone } from "lucide-react";
import type { WorkerAssignment } from "@/lib/workerAssignmentApi";
import { toast } from "sonner";
import { locationTrackingWebSocket } from "@/services/websocketService";

interface WorkerAssignmentCardProps {
  assignment: WorkerAssignment;
  onAccept?: (assignmentId: number) => void;
  onReject?: (assignmentId: number, reason?: string) => void;
  onStart?: (assignmentId: number) => void;
  onComplete?: (assignmentId: number) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
  isStarting?: boolean;
  isCompleting?: boolean;
}

export function WorkerAssignmentCard({
  assignment,
  onAccept,
  onReject,
  onStart,
  onComplete,
  isAccepting = false,
  isRejecting = false,
  isStarting = false,
  isCompleting = false,
}: WorkerAssignmentCardProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Start location tracking
  const startTracking = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setIsConnecting(true);

    // Set a timeout to prevent getting stuck in connecting state
    const connectionTimeout = setTimeout(() => {
      if (isConnecting) {
        setIsConnecting(false);
        toast.error("Connection timeout. Please try again.");
      }
    }, 10000); // 10 second timeout

    // Connect to WebSocket with proper callback handling
    locationTrackingWebSocket.connect(
      assignment.worker_id,
      assignment.booking_id,
      "worker",
      {
        onConnected: () => {
          clearTimeout(connectionTimeout);
          setIsConnecting(false);
          setIsTracking(true);
          toast.success("Connected to location tracking");

          // Start location tracking after successful connection
          locationTrackingWebSocket.startLocationTracking(assignment.ID);
        },
        onError: (error) => {
          clearTimeout(connectionTimeout);
          setIsConnecting(false);
          toast.error(`Connection failed: ${error}`);
        },
      }
    );
  };

  // Stop location tracking
  const stopTracking = () => {
    locationTrackingWebSocket.stopLocationTracking();
    locationTrackingWebSocket.disconnect();
    setIsTracking(false);
    toast.success("Location tracking stopped");
  };

  // Helper function to parse address JSON
  const parseAddress = (addressString: string) => {
    try {
      const address = JSON.parse(addressString);
      return {
        house_number: address.house_number || "",
        address: address.address || "",
        landmark: address.landmark || "",
        city: address.city || "",
        state: address.state || "",
        postal_code: address.postal_code || "",
      };
    } catch {
      return {
        house_number: "",
        address: addressString,
        landmark: "",
        city: "",
        state: "",
        postal_code: "",
      };
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Helper function to format time
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid time";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "assigned":
        return "Assigned";
      case "accepted":
        return "Accepted";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusSubtitle = (status: string) => {
    switch (status) {
      case "assigned":
        return "Please accept or reject this assignment";
      case "accepted":
        return "Ready to start work";
      case "in_progress":
        return "Work is currently in progress";
      case "completed":
        return "Work has been completed";
      default:
        return "Assignment status unknown";
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden">
      <div className="flex">
        {/* Left Side - Status and Service Info */}
        <div className="flex-1 p-6">
          {/* Status Header */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 text-xl mb-1">
              {assignment.booking?.service?.name || "Service"}
            </h3>
            <p className="text-sm text-gray-500 font-medium mb-3">
              {getStatusSubtitle(assignment.status)}
            </p>
          </div>

          {/* Scheduled Date & Time - Prominent Display */}
          <div className="rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Service Date
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(assignment.booking?.scheduled_date || "")} at{" "}
                  {formatTime(assignment.booking?.scheduled_time || "")}
                </div>
              </div>
            </div>
          </div>

          {/* Key Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Booking ID:
              </span>
              <span className="text-sm font-mono font-semibold text-gray-800">
                {assignment.booking?.booking_reference || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-500" />
              <span>
                Customer: {assignment.booking?.user?.name || "N/A"} (
                {assignment.booking?.user?.phone || "N/A"})
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="truncate max-w-[400px]">
                {parseAddress(assignment.booking?.address || "").address}
              </span>
            </div>

            {assignment.booking?.service?.price && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Amount:
                </span>
                <span className="font-semibold text-gray-800">
                  ₹{assignment.booking.service.price.toLocaleString()}
                </span>
              </div>
            )}

            {/* Assignment Notes */}
            {assignment.assignment_notes && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Notes:
                </span>
                <span className="italic">{assignment.assignment_notes}</span>
              </div>
            )}

            {/* Acceptance Notes */}
            {assignment.acceptance_notes && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Acceptance Notes:
                </span>
                <span className="italic">{assignment.acceptance_notes}</span>
              </div>
            )}

            {/* Assigned By Information */}
            {assignment.assigned_by_user && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Assigned by:
                </span>
                <span>{assignment.assigned_by_user.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Status and Actions */}
        <div className="w-64 border-l border-gray-200 p-6 flex flex-col">
          {/* Status Info */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                  assignment.status
                )}`}
              >
                {getStatusText(assignment.status)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {assignment.status === "assigned" && onAccept && onReject && (
              <>
                <button
                  onClick={() => onAccept(assignment.ID)}
                  disabled={isAccepting}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAccepting ? "Accepting..." : "Accept"}
                </button>
                <button
                  onClick={() => onReject(assignment.ID, "Worker rejected")}
                  disabled={isRejecting}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRejecting ? "Rejecting..." : "Decline"}
                </button>
              </>
            )}

            {assignment.status === "accepted" && onStart && (
              <button
                onClick={() => onStart(assignment.ID)}
                disabled={isStarting}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? "Starting..." : "Start Work"}
              </button>
            )}

            {assignment.status === "in_progress" && onComplete && (
              <button
                onClick={() => onComplete(assignment.ID)}
                disabled={isCompleting}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? "Completing..." : "Complete"}
              </button>
            )}

            {assignment.status === "completed" && (
              <button className="w-full px-3 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg cursor-default">
                View Details
              </button>
            )}

            {/* Location Tracking Buttons - Show for in_progress assignments */}
            {assignment.status === "in_progress" && (
              <div className="mt-3 space-y-2">
                {!isTracking ? (
                  <button
                    onClick={startTracking}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    {isConnecting ? "Connecting..." : "Start Tracking"}
                  </button>
                ) : (
                  <button
                    onClick={stopTracking}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Stop Tracking
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Communication Icons - Bottom of Right Side */}
          {(assignment.status === "assigned" ||
            assignment.status === "accepted" ||
            assignment.status === "in_progress") && (
            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="text-center text-xs text-gray-500 mb-2">
                Quick Actions
              </div>
              <div className="flex gap-6 justify-center">
                <button
                  onClick={() => {
                    // TODO: Implement chat functionality
                    console.log("Open chat for assignment:", assignment.ID);
                  }}
                  className="p-2 text-gray-800 hover:text-gray-600 transition-colors"
                  title="Chat with customer"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    // TODO: Implement call functionality
                    console.log(
                      "Call customer for booking:",
                      assignment.booking?.ID
                    );
                  }}
                  className="p-2 text-gray-800 hover:text-gray-600 transition-colors"
                  title="Call customer"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
