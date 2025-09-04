import { useEffect, useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFCM } from "@/hooks/useFCMQuery";
import { requestNotificationPermission } from "@/utils/notificationPermission";
import { messaging } from "@/lib/firebase";

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

export function useNotificationSetup() {
  const { isAuthenticated, user } = useAuth();
  const {
    fcmToken,
    isTokenLoading,
    tokenError,
    requestPermission,
    registerDevice,
    isRegisteringDevice,
    deviceStatus,
  } = useFCM();

  // Track which tokens we've already attempted to register
  const [registeredTokens, setRegisteredTokens] = useState<Set<string>>(
    new Set()
  );

  // Auto-request notification permission when user logs in
  const setupNotifications = useCallback(async () => {
    if (!isAuthenticated || !user || !messaging) return;

    try {
      // Request notification permission
      const hasPermission = await requestNotificationPermission();

      if (hasPermission) {
        // Request FCM token
        await requestPermission();
      } else {
      }
    } catch (error) {
      console.error("Error setting up notifications:", error);
    }
  }, [isAuthenticated, user, requestPermission]);

  // Auto-register device when token is available
  useEffect(() => {
    if (
      fcmToken &&
      deviceStatus &&
      !deviceStatus.isRegistered &&
      !isRegisteringDevice &&
      isAuthenticated &&
      user && // Ensure user exists
      !registeredTokens.has(fcmToken) &&
      messaging // Ensure messaging is available
    ) {
      // Mark this token as attempted to register
      setRegisteredTokens((prev) => new Set(prev).add(fcmToken));

      const navigatorInfo = getNavigatorInfo();
      const deviceData = {
        user_id: user.id, // Add the user ID from auth context
        token: fcmToken,
        platform: "web" as const,
        app_version: "1.0.0",
        device_model: navigatorInfo.userAgent,
        os_version: navigatorInfo.platform,
      };
      registerDevice(deviceData);
    }
  }, [
    fcmToken,
    deviceStatus?.isRegistered,
    isRegisteringDevice,
    isAuthenticated,
    user, // Add user to dependencies
    registeredTokens,
  ]);

  // Setup notifications when user authenticates
  useEffect(() => {
    if (isAuthenticated && user && messaging) {
      // Small delay to ensure auth state is fully established
      const timer = setTimeout(() => {
        setupNotifications();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Reset registered tokens when user logs out
      setRegisteredTokens(new Set());
    }
  }, [isAuthenticated, user, setupNotifications, messaging]);

  return {
    // Current state
    fcmToken,
    isTokenLoading,
    tokenError,
    isRegisteringDevice,
    deviceStatus,

    // Actions
    setupNotifications,
    requestPermission,

    // Status
    isSetupComplete: !!fcmToken && deviceStatus?.isRegistered,
    isSetupInProgress: isTokenLoading || isRegisteringDevice,
  };
}
