import { useState, useEffect, useRef, useCallback } from "react";
import type { NotificationWebSocketMessage } from "@/types/notification";

interface UseNotificationWebSocketProps {
  onNewNotification?: (notification: unknown) => void;
  onUnreadCountUpdate?: (count: number) => void;
  onNotificationRead?: (notificationId: number, isRead: boolean) => void;
  onAllNotificationsRead?: () => void;
  enabled?: boolean;
}

export const useNotificationWebSocket = ({
  onNewNotification,
  onUnreadCountUpdate,
  onNotificationRead,
  onAllNotificationsRead,
  enabled = true,
}: UseNotificationWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

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

  const connect = useCallback(() => {
    if (!enabled) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);

    try {
      // Get auth token from cookies (same as the API client)
      const getCookie = (name: string): string | null => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
        return null;
      };

      const token = getCookie("treesindia_access_token");
      if (!token) {
        setConnectionError("No authentication token found");
        return;
      }

      // Admin notification WebSocket URL
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
      const wsUrl = `${baseUrl}/api/v1/admin/in-app-notifications/ws?token=${token}`;

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          console.warn("WebSocket connection timeout");
          wsRef.current.close();
        }
      }, 10000); // 10 second timeout

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Send join event
        try {
          ws.send(JSON.stringify({ event: "join" }));
        } catch (error) {
          console.error("Failed to send join event:", error);
        }

        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(
                JSON.stringify({
                  event: "ping",
                  timestamp: Date.now(),
                })
              );
            } catch (error) {
              console.error("Failed to send ping:", error);
            }
          }
        }, 30000); // Ping every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const message: NotificationWebSocketMessage = JSON.parse(event.data);

          switch (message.event) {
            case "new_notification":
              if (onNewNotificationRef.current) {
                onNewNotificationRef.current(message.data);
              }
              break;
            case "unread_count_update":
              if (
                onUnreadCountUpdateRef.current &&
                message.data.unread_count !== undefined &&
                typeof message.data.unread_count === "number"
              ) {
                onUnreadCountUpdateRef.current(message.data.unread_count);
              }
              break;
            case "notification_read":
              if (
                onNotificationReadRef.current &&
                message.data.notification_id !== undefined &&
                typeof message.data.notification_id === "number" &&
                typeof message.data.is_read === "boolean"
              ) {
                onNotificationReadRef.current(
                  message.data.notification_id,
                  message.data.is_read
                );
              }
              break;
            case "all_notifications_read":
              if (onAllNotificationsReadRef.current) {
                onAllNotificationsReadRef.current();
              }
              break;
            case "pong":
              // Handle pong response
              break;
            case "error":
              console.error("WebSocket error:", message.data);
              break;
            default:
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        setIsConnected(false);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt to reconnect if not a clean close
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          reconnectAttempts.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError("Failed to reconnect after multiple attempts");
        }
      };

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error("WebSocket error:", error);
        setConnectionError("WebSocket connection error");

        // Don't attempt to reconnect on error - let the close handler handle it
        if (wsRef.current) {
          wsRef.current.close();
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionError("Failed to create WebSocket connection");
    }
  }, [enabled]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnecting");
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    sendMessage({ event: "mark_all_read" });
  }, [sendMessage]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [connect, disconnect, enabled]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    markAllAsRead,
    reconnect: connect,
  };
};
