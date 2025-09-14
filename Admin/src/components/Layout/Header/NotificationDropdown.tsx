import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  X,
  User,
  Calendar,
  DollarSign,
  Shield,
  Key,
  AlertCircle,
} from "lucide-react";
import { useNotifications, useUnreadCount } from "@/services/api/notifications";
import { useNotificationWebSocket } from "@/hooks/useNotificationWebSocket";
import {
  getNotificationIcon,
  getNotificationColor,
} from "@/types/notification";
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
  const [currentOffset, setCurrentOffset] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const limit = 10;

  // API hooks
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    refetch,
  } = useNotifications({
    limit,
    offset: currentOffset,
  });

  const { data: unreadCountData, refetch: refetchUnreadCount } =
    useUnreadCount();

  // WebSocket hook
  const { isConnected } = useNotificationWebSocket({
    onNewNotification: (notification) => {
      setNotifications((prev) => [notification, ...prev]);
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
  });

  // Load notifications
  useEffect(() => {
    if (notificationsData?.data) {
      if (currentOffset === 0) {
        setNotifications(notificationsData.data);
      } else {
        setNotifications((prev) => [...prev, ...notificationsData.data]);
      }
      setHasMore(notificationsData.data.length === limit);
    }
  }, [notificationsData, currentOffset, limit]);

  // Update unread count
  useEffect(() => {
    if (unreadCountData?.unread_count !== undefined) {
      setUnreadCount(unreadCountData.unread_count);
    }
  }, [unreadCountData]);

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
    if (!isLoading && hasMore) {
      setCurrentOffset((prev) => prev + limit);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      handleLoadMore();
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
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
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
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIconComponent(notification.type)}
                  </div>
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

// Helper function to get notification icon component (using Lucide icons instead of emojis)
const getNotificationIconComponent = (type: string) => {
  const iconClass = "w-8 h-8 rounded-full flex items-center justify-center";

  switch (type) {
    case "user_registered":
      return (
        <div className={`${iconClass} bg-green-100 text-green-600`}>
          <User className="h-4 w-4" />
        </div>
      );
    case "booking_created":
      return (
        <div className={`${iconClass} bg-blue-100 text-blue-600`}>
          <Calendar className="h-4 w-4" />
        </div>
      );
    case "payment_received":
      return (
        <div className={`${iconClass} bg-green-100 text-green-600`}>
          <DollarSign className="h-4 w-4" />
        </div>
      );
    case "otp_requested":
      return (
        <div className={`${iconClass} bg-yellow-100 text-yellow-600`}>
          <Shield className="h-4 w-4" />
        </div>
      );
    case "otp_verified":
      return (
        <div className={`${iconClass} bg-green-100 text-green-600`}>
          <Shield className="h-4 w-4" />
        </div>
      );
    case "login_success":
      return (
        <div className={`${iconClass} bg-green-100 text-green-600`}>
          <Key className="h-4 w-4" />
        </div>
      );
    case "login_failed":
      return (
        <div className={`${iconClass} bg-red-100 text-red-600`}>
          <AlertCircle className="h-4 w-4" />
        </div>
      );
    default:
      return (
        <div className={`${iconClass} bg-gray-100 text-gray-600`}>
          <Bell className="h-4 w-4" />
        </div>
      );
  }
};

export default NotificationDropdown;
