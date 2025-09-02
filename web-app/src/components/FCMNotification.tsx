"use client";

import React from "react";
import { Button } from "@mui/material";
import { Bell, BellOff, Send } from "lucide-react";
import { useFCM } from "@/hooks/useFCMQuery";
import { toast } from "sonner";

interface FCMNotificationProps {
  authToken?: string;
  userId?: number;
  onNotificationReceived?: (payload: unknown) => void;
}

// Safe navigator access for SSR
function getNavigatorInfo() {
  if (typeof navigator === "undefined") {
    return {
      userAgent: "Unknown",
      platform: "Unknown"
    };
  }
  
  return {
    userAgent: navigator.userAgent || "Unknown",
    platform: navigator.platform || "Unknown"
  };
}

export const FCMNotification: React.FC<FCMNotificationProps> = ({
  authToken,
  userId,
  onNotificationReceived,
}) => {
  const {
    fcmToken,
    isTokenLoading,
    tokenError,
    deviceStatus,
    isLoadingStatus,
    requestPermission,
    registerDevice,
    unregisterDevice,
    sendNotification,
    isRegisteringDevice,
    isUnregisteringDevice,
    isSendingNotification,
    registerDeviceError,
    unregisterDeviceError,
    sendNotificationError,
  } = useFCM();

  // Handle notification permission request
  const handleRequestPermission = async () => {
    const token = await requestPermission();
    if (token) {
      toast.success("Notification permission granted!");
    } else {
      toast.error("Failed to get notification permission");
    }
  };

  // Handle device registration
  const handleRegisterDevice = async () => {
    if (!fcmToken) {
      toast.error("No FCM token available");
      return;
    }

    if (!authToken) {
      toast.error("Authentication required to register device");
      return;
    }

    if (!userId) {
      toast.error("User ID required to register device");
      return;
    }

    const deviceData = {
      user_id: userId, // Add user ID from auth context
      token: fcmToken,
      platform: "web" as const,
      app_version: "1.0.0",
      device_model: getNavigatorInfo().userAgent,
      os_version: getNavigatorInfo().platform,
    };

    registerDevice(deviceData, {
      onSuccess: () => {
        toast.success("Device registered successfully!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to register device");
      },
    });
  };

  // Handle device unregistration
  const handleUnregisterDevice = async () => {
    if (!fcmToken) {
      toast.error("No FCM token available");
      return;
    }

    if (!authToken) {
      toast.error("Authentication required to unregister device");
      return;
    }

    unregisterDevice(fcmToken, {
      onSuccess: () => {
        console.log("✅ FCM Component: Device unregistered successfully");
        toast.success("Device unregistered successfully!");
      },
      onError: (error) => {
        console.error("❌ FCM Component: Device unregistration failed:", error);
        toast.error(error.message || "Failed to unregister device");
      },
    });
  };

  // Handle test notification
  const handleSendTestNotification = async () => {
    if (!authToken) {
      toast.error("Authentication required to send test notification");
      return;
    }

    if (!userId) {
      toast.error("User ID required to send test notification");
      return;
    }

    const testNotification = {
      user_id: userId,
      type: "system" as const,
      title: "🧪 Test Notification",
      body: "This is a test notification from the web app!",
      data: {
        test_id: Date.now().toString(),
        action: "test_action",
        timestamp: new Date().toISOString(),
      },
    };

    sendNotification(testNotification, {
      onSuccess: () => {
        toast.success("Test notification sent!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send test notification");
      },
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Push Notifications</h3>

      {/* Status Display */}
      <div className="space-y-2 text-sm">
        <div>
          FCM Token:{" "}
          {fcmToken ? `${fcmToken.substring(0, 20)}...` : "Not available"}
        </div>
        <div>Token Loading: {isTokenLoading ? "Yes" : "No"}</div>
        <div>Token Error: {tokenError || "None"}</div>
        <div>
          Device Status: {deviceStatus ? "Registered" : "Not registered"}
        </div>
        <div>Auth Token: {authToken ? "Available" : "Not available"}</div>
        <div>User ID: {userId || "Not set"}</div>
      </div>

      {/* Permission Request */}
      <div>
        <Button
          variant="contained"
          onClick={handleRequestPermission}
          disabled={isTokenLoading}
          startIcon={<Bell />}
        >
          {isTokenLoading ? "Requesting..." : "Request Permission"}
        </Button>
      </div>

      {/* Device Registration */}
      <div>
        <Button
          variant="contained"
          onClick={handleRegisterDevice}
          disabled={!fcmToken || !authToken || !userId || isRegisteringDevice}
          startIcon={<Bell />}
        >
          {isRegisteringDevice ? "Registering..." : "Register Device"}
        </Button>
      </div>

      {/* Device Unregistration */}
      <div>
        <Button
          variant="outlined"
          onClick={handleUnregisterDevice}
          disabled={!fcmToken || !authToken || isUnregisteringDevice}
          startIcon={<BellOff />}
        >
          {isUnregisteringDevice ? "Unregistering..." : "Unregister Device"}
        </Button>
      </div>

      {/* Test Notification */}
      <div>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSendTestNotification}
          disabled={!authToken || !userId || isSendingNotification}
          startIcon={<Send />}
        >
          {isSendingNotification ? "Sending..." : "Send Test Notification"}
        </Button>
      </div>

      {/* Error Display */}
      {tokenError && (
        <div className="text-red-600 text-sm">
          <strong>Token Error:</strong> {tokenError}
        </div>
      )}
      {registerDeviceError && (
        <div className="text-red-600 text-sm">
          <strong>Registration Error:</strong> {registerDeviceError.message}
        </div>
      )}
      {unregisterDeviceError && (
        <div className="text-red-600 text-sm">
          <strong>Unregistration Error:</strong> {unregisterDeviceError.message}
        </div>
      )}
      {sendNotificationError && (
        <div className="text-red-600 text-sm">
          <strong>Send Error:</strong> {sendNotificationError.message}
        </div>
      )}
    </div>
  );
};
