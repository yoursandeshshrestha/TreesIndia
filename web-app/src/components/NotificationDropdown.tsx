"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  User,
  Calendar,
  DollarSign,
  Shield,
  Key,
  AlertCircle,
  CheckCheck,
  MoreHorizontal,
  X,
} from "lucide-react";
import { InAppNotification, NOTIFICATION_TYPES } from "@/types/notification";
import {
  useNotifications,
  useUnreadCount,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { useNotificationWebSocket } from "@/hooks/useNotificationWebSocket";
import { toast } from "sonner";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case NOTIFICATION_TYPES.USER_REGISTERED:
    case NOTIFICATION_TYPES.WORKER_APPLICATION:
    case NOTIFICATION_TYPES.BROKER_APPLICATION:
      return <User className="w-4 h-4" />;
    case NOTIFICATION_TYPES.BOOKING_CREATED:
    case NOTIFICATION_TYPES.WORKER_ASSIGNED:
    case NOTIFICATION_TYPES.WORKER_STARTED:
    case NOTIFICATION_TYPES.WORKER_COMPLETED:
      return <Calendar className="w-4 h-4" />;
    case NOTIFICATION_TYPES.PAYMENT_RECEIVED:
    case NOTIFICATION_TYPES.PAYMENT_CONFIRMATION:
    case NOTIFICATION_TYPES.SUBSCRIPTION_PURCHASE:
      return <DollarSign className="w-4 h-4" />;
    case NOTIFICATION_TYPES.APPLICATION_ACCEPTED:
    case NOTIFICATION_TYPES.APPLICATION_REJECTED:
      return <Shield className="w-4 h-4" />;
    case NOTIFICATION_TYPES.OTP_REQUESTED:
    case NOTIFICATION_TYPES.OTP_VERIFIED:
    case NOTIFICATION_TYPES.LOGIN_SUCCESS:
    case NOTIFICATION_TYPES.LOGIN_FAILED:
      return <Key className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

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
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    refetch,
  } = useNotifications({
    limit,
    page: currentPage,
  });

  const { data: unreadCountData, refetch: refetchUnreadCount } =
    useUnreadCount();

  // Mark all as read hook
  const { mutate: markAllAsRead, isPending: isMarkingAllAsRead } =
    useMarkAllAsRead();

  // WebSocket connection
  const { isConnected } = useNotificationWebSocket({
    onNewNotification: (notification) => {
      // New notification will be handled by the store automatically
      console.log("New notification received:", notification);
    },
    onUnreadCountUpdate: (count) => {
      setUnreadCount(count);
    },
    onAllNotificationsRead: () => {
      setUnreadCount(0);
      // Update local notifications to mark all as read
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true }))
      );
    },
  });

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

  const handleRefresh = () => {
    refetch();
    refetchUnreadCount();
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
      {!isConnected && (
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
              You'll see updates about your bookings, payments, and more here
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
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        !notification.is_read
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
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
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
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
