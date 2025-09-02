"use client";

import { useState } from "react";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { Bell, X, CheckCircle, AlertCircle } from "lucide-react";

export default function NotificationBanner() {
  const {
    hasPermission,
    isDenied,
    isDefault,
    requestPermission,
    isRequesting,
    isInitialized,
  } = useNotificationPermission();
  const [isVisible, setIsVisible] = useState(true);

  // Don't show banner if not initialized yet, permission is granted, or user dismissed it
  if (!isInitialized || hasPermission || !isVisible) {
    return null;
  }

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5" />
          <div>
            <p className="font-medium">
              {isDenied
                ? "Notifications are disabled"
                : "Enable notifications to stay updated"}
            </p>
            <p className="text-sm text-blue-100">
              {isDenied
                ? "You can enable them in your browser settings"
                : "Get updates about your bookings, payments, and more"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isDefault && (
            <button
              onClick={handleEnableNotifications}
              disabled={isRequesting}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {isRequesting ? "Enabling..." : "Enable"}
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="text-blue-100 hover:text-white transition-colors"
            aria-label="Dismiss notification banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
