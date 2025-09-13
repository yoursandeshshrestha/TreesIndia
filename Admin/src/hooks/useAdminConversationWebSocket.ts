import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketMessage {
  event: string;
  data?: unknown;
  timestamp?: number;
}

interface UseAdminConversationWebSocketProps {
  onMessage?: (message: unknown) => void;
  onStatusUpdate?: (status: unknown) => void;
  onTotalUnreadCount?: (count: number) => void;
  onConversationUnreadCount?: (conversationId: number, count: number) => void;
}

export const useAdminConversationWebSocket = ({
  onMessage,
  onStatusUpdate,
  onTotalUnreadCount,
  onConversationUnreadCount,
}: UseAdminConversationWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Callback refs to avoid stale closures
  const onMessageRef = useRef(onMessage);
  const onStatusUpdateRef = useRef(onStatusUpdate);
  const onTotalUnreadCountRef = useRef(onTotalUnreadCount);
  const onConversationUnreadCountRef = useRef(onConversationUnreadCount);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onStatusUpdateRef.current = onStatusUpdate;
  }, [onStatusUpdate]);

  useEffect(() => {
    onTotalUnreadCountRef.current = onTotalUnreadCount;
  }, [onTotalUnreadCount]);

  useEffect(() => {
    onConversationUnreadCountRef.current = onConversationUnreadCount;
  }, [onConversationUnreadCount]);

  const connect = useCallback(() => {
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

      // Admin WebSocket URL for monitoring all conversations
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
      const wsUrl = `${baseUrl}/api/v1/admin/ws/conversations/monitor?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Send a test message to verify connection
        ws.send(JSON.stringify({ event: "test_connection" }));

        // Request conversations data
        ws.send(JSON.stringify({ event: "get_conversations" }));

        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: "ping" }));
          }
        }, 30000); // Ping every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          switch (data.event) {
            case "conversation_message":
            case "new_conversation_message":
              if (data.data && onMessageRef.current) {
                onMessageRef.current(data.data);
              }
              break;
            case "conversation_status":
              if (onStatusUpdateRef.current) {
                onStatusUpdateRef.current(data.data);
              }
              break;
            case "total_unread_count":
              if (data.data && onTotalUnreadCountRef.current) {
                const countData = data.data as { total_unread_count: number };
                onTotalUnreadCountRef.current(countData.total_unread_count);
              }
              break;
            case "conversation_unread_count":
              if (data.data && onConversationUnreadCountRef.current) {
                const countData = data.data as {
                  conversation_id: number;
                  unread_count: number;
                };
                onConversationUnreadCountRef.current(
                  countData.conversation_id,
                  countData.unread_count
                );
              }
              break;
            case "conversations_data":
              // Handle conversations data response
              break;
            case "pong":
              // Handle pong response
              break;
            case "test_connection_response":
              break;
            default:
          }
        } catch (error) {
          console.error("Error parsing admin WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt to reconnect if not a normal closure
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectAttempts.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError("Failed to reconnect after multiple attempts");
        }
      };

      ws.onerror = () => {
        setConnectionError("WebSocket connection error");
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch {
      setConnectionError("Failed to create WebSocket connection");
    }
  }, []);

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
      wsRef.current.close(1000, "Component unmounting");
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendPing = useCallback(() => {
    sendMessage({ event: "ping" });
  }, [sendMessage]);

  const requestConversationsData = useCallback(() => {
    sendMessage({ event: "get_conversations" });
  }, [sendMessage]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    sendPing,
    requestConversationsData,
    connect,
    disconnect,
  };
};
