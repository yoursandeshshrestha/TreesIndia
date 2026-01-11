import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketMessage {
  event: string;
  data?: unknown;
  timestamp?: number;
}

interface UseConversationWebSocketProps {
  onMessage?: (message: unknown) => void;
  onStatusUpdate?: (status: unknown) => void;
  onTotalUnreadCount?: (count: number) => void;
  onConversationUnreadCount?: (conversationId: number, count: number) => void;
}

export const useConversationWebSocket = ({
  onMessage,
  onStatusUpdate,
  onTotalUnreadCount,
  onConversationUnreadCount,
}: UseConversationWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const hasConnectedOnce = useRef(false);
  const hasAuthError = useRef(false);

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
    hasAuthError.current = false;

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

      // User WebSocket URL for monitoring conversations
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
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        hasConnectedOnce.current = true;
        hasAuthError.current = false;

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
              console.log("Unknown WebSocket event:", data.event);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Check if this is an authentication error
        const isAuthError =
          event.code === 1008 || // Policy violation (often used for auth failures)
          event.code === 4401 || // Custom 401 code
          (!hasConnectedOnce.current && reconnectAttempts.current >= 3); // Multiple failures without ever connecting

        if (isAuthError) {
          hasAuthError.current = true;
          setConnectionError("Authentication failed. Please log in again.");
          console.error("WebSocket authentication error - stopping reconnection attempts");
          return;
        }

        // Attempt to reconnect if not a clean close and not an auth error
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts &&
          !hasAuthError.current
        ) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          reconnectAttempts.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(
              `Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`
            );
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError("Failed to reconnect after multiple attempts");
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("WebSocket connection error");
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
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
      wsRef.current.close(1000, "Client disconnecting");
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
    reconnectAttempts.current = 0;
    hasConnectedOnce.current = false;
    hasAuthError.current = false;
  }, []);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    reconnect: connect,
  };
};
