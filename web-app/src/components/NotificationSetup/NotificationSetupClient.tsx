"use client";

import { useNotificationSetup } from "@/hooks/useNotificationSetup";

export default function NotificationSetupClient() {
  // This hook will automatically handle notification permission and device registration
  // when a user is authenticated. No UI is needed for this component.
  useNotificationSetup();

  // Return null since this is a utility component with no UI
  return null;
}
