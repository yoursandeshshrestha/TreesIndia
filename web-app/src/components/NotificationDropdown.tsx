"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Bell, CheckCheck, X } from "lucide-react";
import { InAppNotification } from "@/types/notification";
import {
  useNotifications,
  useUnreadCount,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { useGlobalWebSocket } from "@/components/GlobalWebSocketProvider/GlobalWebSocketProvider";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Parse and format address from JSON string or object
const formatAddress = (address: string | object | undefined): string => {
  if (!address) return "Unknown address";

  // If it's already a string and not JSON, return it
  if (typeof address === "string") {
    // Check if it's a JSON string
    if (address.trim().startsWith("{") && address.trim().endsWith("}")) {
      try {
        const parsed = JSON.parse(address);
        return formatAddressObject(parsed);
      } catch {
        // If parsing fails, return as is
        return address;
      }
    }
    return address;
  }

  // If it's an object, format it
  if (typeof address === "object") {
    return formatAddressObject(address);
  }

  return String(address);
};

// Address object type for notifications
interface AddressObject {
  house_number?: string;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  name?: string;
}

// Format address object into readable string
const formatAddressObject = (addressObj: AddressObject): string => {
  const parts: string[] = [];

  if (addressObj.house_number) parts.push(addressObj.house_number);
  if (addressObj.address) parts.push(addressObj.address);
  if (addressObj.landmark) parts.push(addressObj.landmark);
  if (addressObj.city) parts.push(addressObj.city);
  if (addressObj.state) parts.push(addressObj.state);
  if (addressObj.postal_code) parts.push(addressObj.postal_code);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  if (addressObj.name) return addressObj.name;

  return "Unknown address";
};

// Extract JSON object from string (handles nested objects)
const extractJSONFromString = (
  str: string,
  startIndex: number
): { json: string; endIndex: number } | null => {
  if (str[startIndex] !== "{") return null;

  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  const start = startIndex;

  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          return {
            json: str.substring(start, i + 1),
            endIndex: i + 1,
          };
        }
      }
    }
  }

  return null;
};

// Clean message by removing raw JSON addresses and replacing with formatted ones
const formatNotificationMessage = (notification: InAppNotification): string => {
  let message = notification.message;

  // For new assignment notifications, clean up any raw JSON in the message
  if (notification.type === "new_assignment" && notification.data) {
    const address = notification.data.address;
    if (address) {
      const formattedAddress = formatAddress(address);

      // Find " at " followed by JSON object
      const atIndex = message.lastIndexOf(" at ");
      if (atIndex !== -1) {
        const jsonStart = atIndex + 4; // After " at "
        const jsonResult = extractJSONFromString(message, jsonStart);

        if (jsonResult) {
          try {
            // Verify it's a valid address JSON by checking for address fields
            const parsed = JSON.parse(jsonResult.json);
            if (parsed.city || parsed.address || parsed.state) {
              // Replace the JSON with formatted address
              message = message.substring(0, atIndex + 4) + formattedAddress;
            }
          } catch {
            // If parsing fails, just use the formatted address from data
            message = message.substring(0, atIndex + 4) + formattedAddress;
          }
        } else if (
          message.includes('"city"') ||
          message.includes('"address"')
        ) {
          // Fallback: if we detect JSON-like content but extraction failed, replace from "at " onwards
          message = message.substring(0, atIndex + 4) + formattedAddress;
        }
      }
    }
  }

  return message;
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  const limit = 10;

  // API hooks
  const { data: notificationsData, isLoading: isLoadingNotifications } =
    useNotifications({
      limit,
      page: currentPage,
    });

  const { data: unreadCountData } = useUnreadCount();

  // Mark all as read hook
  const { mutate: markAllAsRead, isPending: isMarkingAllAsRead } =
    useMarkAllAsRead();

  // Get global WebSocket state
  const { isNotificationConnected } = useGlobalWebSocket();

  // Load notifications
  useEffect(() => {
    if (notificationsData?.data) {
      if (currentPage === 1) {
        setNotifications(notificationsData.data);
      } else {
        setNotifications((prev) => [...prev, ...notificationsData.data]);
      }
      // Use pagination metadata to determine if there are more notifications
      setHasMore(notificationsData.pagination?.has_next || false);
      // Reset loading ref when data is loaded
      isLoadingMoreRef.current = false;
    }
  }, [notificationsData, currentPage, limit]);

  // Update unread count
  useEffect(() => {
    if (unreadCountData?.unread_count !== undefined) {
      setUnreadCount(unreadCountData.unread_count);
    }
  }, [unreadCountData]);

  // Reset state when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setNotifications([]);
      setCurrentPage(1);
      setHasMore(true);
      setIsLoading(false);
      isLoadingMoreRef.current = false;
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleLoadMore = () => {
    if (
      !isLoading &&
      hasMore &&
      !isLoadingNotifications &&
      !isLoadingMoreRef.current
    ) {
      isLoadingMoreRef.current = true;
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      handleLoadMore();
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed top-18 right-140 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] flex flex-col"
      style={{ zIndex: 100 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!isNotificationConnected && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Real-time updates disconnected
            </span>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {isLoadingNotifications && notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              You&apos;ll see updates about your bookings, payments, and more
              here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${
                          !notification.is_read
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">
                      {formatNotificationMessage(notification)}
                    </p>
                    {notification.type === "new_assignment" &&
                      notification.data?.address && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-blue-500">
                          <p className="font-medium text-gray-700 mb-1">
                            Location:
                          </p>
                          <p className="text-gray-600">
                            {formatAddress(notification.data.address)}
                          </p>
                          {notification.data.scheduled_date && (
                            <p className="text-gray-500 mt-1">
                              {new Date(
                                notification.data.scheduled_date as string
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                              {notification.data.scheduled_time && (
                                <>
                                  {" "}
                                  at{" "}
                                  {new Date(
                                    notification.data.scheduled_time as string
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="p-4 text-center">
            {isLoadingMoreRef.current ? (
              <div className="text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mx-auto mb-2"></div>
                Loading more...
              </div>
            ) : (
              <button
                onClick={handleLoadMore}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Load more notifications
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
