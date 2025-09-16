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
      const wsUrl = `ws://localhost:8080/api/v1/in-app-notifications/ws?token=${token}`;
      console.log("Connecting to notification WebSocket:", wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("Notification WebSocket connected");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPing();
        notificationStore.setError(null);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: NotificationWebSocketMessage = JSON.parse(event.data);
          console.log("Notification WebSocket message received:", message);
          this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing notification WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(
          "Notification WebSocket disconnected:",
          event.code,
          event.reason
        );
        this.isConnecting = false;
        this.ws = null;
        this.stopPing();

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.token) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("Notification WebSocket error:", error);
        this.isConnecting = false;
        notificationStore.setError("WebSocket connection error");
      };
    } catch (error) {
      console.error(
        "Failed to create notification WebSocket connection:",
        error
      );
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

  send(message: Record<string, any>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Cannot send message:", message);
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
        console.log("Unknown notification WebSocket event:", message.event);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      notificationStore.setError("Connection lost. Please refresh the page.");
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(
      `Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`
    );

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
