/**
 * Check if we're running in a browser environment
 */
function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Request notification permission from the user
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // Check if we're in a browser environment
    if (!isClient()) {
      console.warn("Not in browser environment");
      return false;
    }

    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    // Check current permission status
    const currentPermission = Notification.permission;

    // If already granted, return true
    if (currentPermission === "granted") {
      return true;
    }

    // If denied, return false
    if (currentPermission === "denied") {
      console.warn("Notification permission was previously denied");
      return false;
    }

    // Request permission if not already determined
    if (currentPermission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

/**
 * Check if notification permission is granted
 * @returns boolean - true if permission granted, false otherwise
 */
export function hasNotificationPermission(): boolean {
  if (!isClient()) {
    return false;
  }
  
  if (!("Notification" in window)) {
    return false;
  }
  return Notification.permission === "granted";
}

/**
 * Check if notification permission is denied
 * @returns boolean - true if permission denied, false otherwise
 */
export function isNotificationPermissionDenied(): boolean {
  if (!isClient()) {
    return false;
  }
  
  if (!("Notification" in window)) {
    return false;
  }
  return Notification.permission === "denied";
}

/**
 * Check if notification permission is not yet determined
 * @returns boolean - true if permission not yet determined, false otherwise
 */
export function isNotificationPermissionDefault(): boolean {
  if (!isClient()) {
    return false;
  }
  
  if (!("Notification" in window)) {
    return false;
  }
  return Notification.permission === "default";
}
