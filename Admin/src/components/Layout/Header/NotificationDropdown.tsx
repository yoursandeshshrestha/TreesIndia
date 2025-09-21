import React, { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import {
  useNotifications,
  useUnreadCount,
  useMarkAllAsRead,
} from "@/services/api/notifications";
import { useNotificationWebSocket } from "@/hooks/useNotificationWebSocket";
import { getNotificationColor } from "@/types/notification";
import type { InAppNotification } from "@/types/notification";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
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
  } = useNotifications({
    limit,
    page: currentPage,
  });

  const { data: unreadCountData } = useUnreadCount();

  // Mark all as read hook
  const markAllAsReadMutation = useMarkAllAsRead();

  // WebSocket hook - only connect when dropdown is open
  const { isConnected } = useNotificationWebSocket({
    onNewNotification: (notification) => {
      // Type assertion to ensure the notification matches InAppNotification interface
      const typedNotification = notification as InAppNotification;
      setNotifications((prev) => [typedNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    onUnreadCountUpdate: (count) => {
      setUnreadCount(count);
    },
    onNotificationRead: (notificationId, isRead) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? {
                ...notif,
                is_read: isRead,
                read_at: isRead ? new Date().toISOString() : undefined,
              }
            : notif
        )
      );
    },
    onAllNotificationsRead: () => {
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    },
    enabled: isOpen, // Only connect when dropdown is open
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

  // Reset loading ref on error
  useEffect(() => {
    if (notificationsData === undefined && isLoadingNotifications === false) {
      isLoadingMoreRef.current = false;
    }
  }, [notificationsData, isLoadingNotifications]);

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

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed w-96 bg-white rounded-lg shadow-xl border-2 border-gray-200 max-h-[80vh] flex flex-col"
      style={{
        top: "60px",
        right: "244px",
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Bell size={16} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Close"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCheck size={14} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
          <p className="text-xs text-yellow-800">
            ⚠️ Real-time updates disconnected
          </p>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {isLoadingNotifications && notifications.length === 0 ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
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
                        className={`text-sm font-medium ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
            >
              {isLoading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          {notifications.length} notification
          {notifications.length !== 1 ? "s" : ""}
          {unreadCount > 0 && ` • ${unreadCount} unread`}
        </p>
      </div>
    </div>
  );
};

export default NotificationDropdown;
