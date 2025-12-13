import { notificationStore } from "@/utils/notificationStore";
import type { NotificationWebSocketMessage } from "@/types/notification";
import { playSound } from "@/utils/soundUtils";

class NotificationWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private token: string | null = null;
  private isConnecting = false;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
  }

  connect(token: string): void {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.token = token;
    this.isConnecting = true;
    notificationStore.setError(null);

    try {
      // Always derive protocol from API URL to ensure consistency
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const apiBase = apiUrl.replace(/\/api\/v1$/, ""); // Remove /api/v1 suffix
      const wsProtocol = apiBase.startsWith("https") ? "wss" : "ws";

      // If NEXT_PUBLIC_WS_URL is set, extract host/port from it, otherwise use API URL
      let hostAndPath = apiBase.replace(/^https?:\/\//, ""); // Remove http:// or https://
      if (process.env.NEXT_PUBLIC_WS_URL) {
        // Extract host/port from WS URL (ignore protocol)
        const wsUrlMatch =
          process.env.NEXT_PUBLIC_WS_URL.match(/^wss?:\/\/(.+)$/);
        if (wsUrlMatch) {
          hostAndPath = wsUrlMatch[1];
        }
      }

      const baseUrl = `${wsProtocol}://${hostAndPath}`;
      const wsUrl = `${baseUrl}/api/v1/in-app-notifications/ws?token=${token}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPing();
        notificationStore.setError(null);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: NotificationWebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch {
          // Ignore parsing errors
        }
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        this.ws = null;
        this.stopPing();

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.token) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.isConnecting = false;
        notificationStore.setError("WebSocket connection error");
      };
    } catch {
      this.isConnecting = false;
      notificationStore.setError("Failed to connect to WebSocket");
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopPing();

    if (this.ws) {
      this.ws.close(1000, "Client disconnecting");
      this.ws = null;
    }

    this.token = null;
    this.reconnectAttempts = 0;
  }

  send(message: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
    }
  }

  private handleMessage(message: NotificationWebSocketMessage): void {
    switch (message.event) {
      case "new_notification":
        if (message.data.notification) {
          notificationStore.addNotification(message.data.notification);
          // Play notification sound for new notifications
          playSound("notification");
        }
        if (message.data.unread_count !== undefined) {
          notificationStore.setUnreadCount(message.data.unread_count);
        }
        break;

      case "unread_count_update":
        if (message.data.unread_count !== undefined) {
          notificationStore.setUnreadCount(message.data.unread_count);
        }
        break;

      case "notification_read":
        if (message.data.notification_id) {
          notificationStore.markAsRead(message.data.notification_id);
        }
        break;

      case "all_notifications_read":
        notificationStore.markAllAsRead();
        break;

      case "notification_updated":
        if (message.data.notification) {
          notificationStore.updateNotification(
            message.data.notification.id,
            message.data.notification
          );
        }
        break;

      default:
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      notificationStore.setError("Connection lost. Please refresh the page.");
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create and export singleton instance
export const notificationWebSocketService = new NotificationWebSocketService();
