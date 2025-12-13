import { conversationStore } from "@/utils/conversationStore";

interface WebSocketMessage {
  event: string;
  data?: unknown;
  timestamp?: number;
}

class ConversationWebSocketService {
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
      const wsUrl = `${baseUrl}/api/v1/ws/conversations/monitor?token=${token}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPing();

        // Send a test message to verify connection
        this.send({ event: "test_connection" });

        // Request conversations data
        this.send({ event: "get_conversations" });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing conversation WebSocket message:", error);
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

      this.ws.onerror = (error) => {
        console.error("Conversation WebSocket error:", error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error(
        "Failed to create conversation WebSocket connection:",
        error
      );
      this.isConnecting = false;
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
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.event) {
      case "conversation_message":
      case "new_conversation_message":
        if (message.data) {
          // Transform message data to ConversationUpdateData format
          const messageData = message.data as {
            conversation_id: number;
            message: {
              id?: number;
              message?: string;
              created_at?: string;
              sender_id?: number;
              sender?: {
                user_type?: string;
              };
            };
          };
          const conversationUpdateData = {
            event: message.event,
            conversation_id: messageData.conversation_id,
            message: {
              id: messageData.message.id || Date.now(),
              message: messageData.message.message || "",
              created_at:
                messageData.message.created_at || new Date().toISOString(),
              sender_id: messageData.message.sender_id || 0,
              sender: messageData.message.sender
                ? {
                    user_type: messageData.message.sender.user_type || "user",
                  }
                : undefined,
            },
          };
          // Emit message updates to conversation store for other components
          conversationStore.emitUpdate(conversationUpdateData);
        }
        break;

      case "conversation_status":
        // Handle status updates if needed
        break;

      case "total_unread_count":
        if (message.data) {
          const countData = message.data as { total_unread_count: number };
          conversationStore.setCurrentUnreadCount(countData.total_unread_count);
          conversationStore.emitTotalUnreadCountUpdate(
            countData.total_unread_count
          );
        }
        break;

      case "conversation_unread_count":
        if (message.data) {
          const countData = message.data as {
            conversation_id: number;
            unread_count: number;
          };
          conversationStore.emitConversationUnreadCountUpdate(
            countData.conversation_id,
            countData.unread_count
          );
        }
        break;

      case "conversation_read":
        if (message.data) {
          const readData = message.data as { conversation_id: number };
          conversationStore.emitReadStatusUpdate(readData.conversation_id);
        }
        break;

      case "conversations_data":
        // Handle conversations data response
        break;

      case "pong":
        // Handle pong response
        break;

      case "test_connection_response":
        // Handle test connection response
        break;

      default:
        // Unknown event, ignore
        break;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
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
        this.send({ event: "ping" });
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
export const conversationWebSocketService = new ConversationWebSocketService();
