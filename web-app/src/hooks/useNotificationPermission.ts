import { useState, useCallback, useEffect } from "react";
import {
  requestNotificationPermission,
  hasNotificationPermission,
  isNotificationPermissionDenied,
  isNotificationPermissionDefault,
} from "@/utils/notificationPermission";

export function useNotificationPermission() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [lastRequestResult, setLastRequestResult] = useState<boolean | null>(
    null
  );
  const [hasPermission, setHasPermission] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check permissions after component mounts (client-side only)
  useEffect(() => {
    setHasPermission(hasNotificationPermission());
    setIsDenied(isNotificationPermissionDenied());
    setIsDefault(isNotificationPermissionDefault());
    setIsInitialized(true);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    try {
      const result = await requestNotificationPermission();
      setLastRequestResult(result);
      
      // Update local state after permission request
      if (result) {
        setHasPermission(true);
        setIsDefault(false);
      }
      
      return result;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  return {
    // Current permission status
    hasPermission,
    isDenied,
    isDefault,
    isInitialized,

    // Request permission
    requestPermission,
    isRequesting,
    lastRequestResult,
  };
}
