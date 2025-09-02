import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth-api";
import { fcmApi } from "@/lib/fcmApi";
import { messaging, getToken, onMessage } from "@/lib/firebase";
import { toast } from "sonner";
import { useState, useCallback, useEffect } from "react";
import { requestNotificationPermission } from "@/utils/notificationPermission";

// Query keys
export const fcmKeys = {
  all: ["fcm"] as const,
  devices: () => [...fcmKeys.all, "devices"] as const,
  deviceStatus: (token: string) =>
    [...fcmKeys.all, "deviceStatus", token] as const,
};

// Hook for getting user's registered devices
export function useUserDevices() {
  const token = authAPI.getAccessToken();

  return useQuery({
    queryKey: fcmKeys.devices(),
    queryFn: () => fcmApi.getUserDevices(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for checking device registration status
export function useDeviceStatus(fcmToken: string | null) {
  const token = authAPI.getAccessToken();

  return useQuery({
    queryKey: fcmKeys.deviceStatus(fcmToken || ""),
    queryFn: () => fcmApi.checkDeviceStatus(fcmToken!),
    enabled: !!token && !!fcmToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for FCM mutations
export function useFCMMutations() {
  const queryClient = useQueryClient();
  const token = authAPI.getAccessToken();

  // Register device mutation
  const registerDeviceMutation = useMutation({
    mutationFn: async (deviceData: {
      user_id: number;
      token: string;
      platform: "web";
      app_version: string;
      device_model: string;
      os_version: string;
    }) => {
      return fcmApi.registerDevice(deviceData);
    },
    onSuccess: () => {
      // Invalidate and refetch device-related queries
      queryClient.invalidateQueries({ queryKey: fcmKeys.devices() });
      queryClient.invalidateQueries({ queryKey: fcmKeys.all });
    },
    onError: (error) => {
      console.error("Error registering device:", error);
    },
  });

  // Unregister device mutation
  const unregisterDeviceMutation = useMutation({
    mutationFn: async (fcmToken: string) => {
      return fcmApi.unregisterDevice(fcmToken);
    },
    onSuccess: () => {
      // Invalidate and refetch device-related queries
      queryClient.invalidateQueries({ queryKey: fcmKeys.devices() });
      queryClient.invalidateQueries({ queryKey: fcmKeys.all });
    },
    onError: (error) => {
      console.error("Error unregistering device:", error);
    },
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: {
      user_id: number;
      type:
        | "booking"
        | "worker_assignment"
        | "payment"
        | "subscription"
        | "chat"
        | "promotional"
        | "system";
      title: string;
      body: string;
      data?: Record<string, string>;
      click_action?: string;
    }) => {
      return fcmApi.sendNotification(notificationData);
    },
    onError: (error) => {
      console.error("Error sending notification:", error);
    },
  });

  return {
    // Register device
    registerDevice: registerDeviceMutation.mutate,
    registerDeviceAsync: registerDeviceMutation.mutateAsync,
    isRegisteringDevice: registerDeviceMutation.isPending,
    registerDeviceError: registerDeviceMutation.error,

    // Unregister device
    unregisterDevice: unregisterDeviceMutation.mutate,
    unregisterDeviceAsync: unregisterDeviceMutation.mutateAsync,
    isUnregisteringDevice: unregisterDeviceMutation.isPending,
    unregisterDeviceError: unregisterDeviceMutation.error,

    // Send notification
    sendNotification: sendNotificationMutation.mutate,
    sendNotificationAsync: sendNotificationMutation.mutateAsync,
    isSendingNotification: sendNotificationMutation.isPending,
    sendNotificationError: sendNotificationMutation.error,
  };
}

// Hook for FCM token management
export function useFCMToken() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request permission and get token
  const requestPermission = useCallback(async () => {
    if (!messaging) {
      setError("Firebase messaging not available");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request notification permission using utility function
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        throw new Error("Notification permission denied");
      }

      // Get FCM token
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        throw new Error("VAPID key not configured");
      }

      const token = await getToken(messaging, {
        vapidKey,
      });

      if (token) {
        setFcmToken(token);
        return token;
      } else {
        throw new Error("Failed to get FCM token");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup message listener
  useEffect(() => {
    if (fcmToken && messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        // Show toast notification
        if (
          payload &&
          typeof payload === "object" &&
          "notification" in payload
        ) {
          const notification = (
            payload as { notification?: { title?: string; body?: string } }
          ).notification;

          if (notification) {
            toast(notification.title || "New Notification", {
              description: notification.body,
              action: {
                label: "View",
                onClick: () => {
                  // Handle notification click
                  if (
                    payload &&
                    typeof payload === "object" &&
                    "data" in payload
                  ) {
                    const data = (payload as { data?: { action?: string } })
                      .data;
                    if (data?.action) {
                      // Navigate based on action
                    }
                  }
                },
              },
            });
          }
        }
      });

      return unsubscribe;
    }
  }, [fcmToken]);

  return {
    fcmToken,
    isLoading,
    error,
    requestPermission,
  };
}

// Combined hook for FCM functionality
export function useFCM() {
  const {
    fcmToken,
    isLoading: isTokenLoading,
    error: tokenError,
    requestPermission,
  } = useFCMToken();
  const {
    data: userDevices,
    isLoading: isLoadingDevices,
    error: devicesError,
  } = useUserDevices();
  const { data: deviceStatus, isLoading: isLoadingStatus } =
    useDeviceStatus(fcmToken);
  const mutations = useFCMMutations();

  // Auto-registration is now handled in useNotificationSetup hook
  // to prevent duplicate registration attempts

  return {
    // Token state
    fcmToken,
    isTokenLoading,
    tokenError,

    // Device state
    userDevices: userDevices?.data || [],
    isLoadingDevices,
    devicesError,
    deviceStatus,
    isLoadingStatus,

    // Actions
    requestPermission,
    ...mutations,
  };
}
