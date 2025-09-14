import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { notificationWebSocketService } from "@/services/notificationWebSocketService";
import { notificationStore } from "@/utils/notificationStore";
import type { NotificationWebSocketMessage } from "@/types/notification";

interface UseNotificationWebSocketProps {
  onNewNotification?: (notification: any) => void;
  onUnreadCountUpdate?: (count: number) => void;
  onNotificationRead?: (notificationId: number, isRead: boolean) => void;
  onAllNotificationsRead?: () => void;
}

export const useNotificationWebSocket = ({
  onNewNotification,
  onUnreadCountUpdate,
  onNotificationRead,
  onAllNotificationsRead,
}: UseNotificationWebSocketProps = {}) => {
  const { user, token, isAuthenticated } = useAuth();

  // Callback refs to avoid stale closures
  const onNewNotificationRef = useRef(onNewNotification);
  const onUnreadCountUpdateRef = useRef(onUnreadCountUpdate);
  const onNotificationReadRef = useRef(onNotificationRead);
  const onAllNotificationsReadRef = useRef(onAllNotificationsRead);

  useEffect(() => {
    onNewNotificationRef.current = onNewNotification;
  }, [onNewNotification]);

  useEffect(() => {
    onUnreadCountUpdateRef.current = onUnreadCountUpdate;
  }, [onUnreadCountUpdate]);

  useEffect(() => {
    onNotificationReadRef.current = onNotificationRead;
  }, [onNotificationRead]);

  useEffect(() => {
    onAllNotificationsReadRef.current = onAllNotificationsRead;
  }, [onAllNotificationsRead]);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && token) {
      console.log("Connecting to notification WebSocket for user:", user.id);
      notificationWebSocketService.connect(token);
    } else {
      console.log(
        "Disconnecting notification WebSocket - user not authenticated"
      );
      notificationWebSocketService.disconnect();
      notificationStore.clear();
    }

    return () => {
      notificationWebSocketService.disconnect();
    };
  }, [isAuthenticated, user, token]);

  // Subscribe to notification store changes
  useEffect(() => {
    const unsubscribe = notificationStore.subscribe((state) => {
      // Call callbacks when state changes
      if (state.notifications.length > 0) {
        const latestNotification = state.notifications[0];
        onNewNotificationRef.current?.(latestNotification);
      }

      onUnreadCountUpdateRef.current?.(state.unreadCount);
    });

    return unsubscribe;
  }, []);

  return {
    isConnected: notificationWebSocketService.isConnected,
    connect: (token: string) => notificationWebSocketService.connect(token),
    disconnect: () => notificationWebSocketService.disconnect(),
    send: (message: Record<string, any>) =>
      notificationWebSocketService.send(message),
  };
};
