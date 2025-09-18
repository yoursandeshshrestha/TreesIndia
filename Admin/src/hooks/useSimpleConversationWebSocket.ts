import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketMessage {
  event: string;
  conversation_id?: number;
  message?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

interface UseSimpleConversationWebSocketProps {
  conversationId: number | null;
  onMessage?: (message: Record<string, unknown>) => void;
  onStatusUpdate?: (status: Record<string, unknown>) => void;
  isConversationOpen?: boolean; // Add flag to indicate if conversation is currently open
}

export const useSimpleConversationWebSocket = ({
  conversationId,
  onMessage,
  onStatusUpdate,
  isConversationOpen = false, // eslint-disable-line @typescript-eslint/no-unused-vars
}: UseSimpleConversationWebSocketProps) => {
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

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onStatusUpdateRef.current = onStatusUpdate;
  }, [onStatusUpdate]);

  const connect = useCallback(() => {
    if (!conversationId || wsRef.current?.readyState === WebSocket.OPEN) {
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

      // Correct WebSocket URL with token as query parameter
      const wsUrl = `${
        process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"
      }/api/v1/ws/conversations/connect?conversation_id=${conversationId}&token=${token}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

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
              if (data.message && onMessageRef.current) {
                onMessageRef.current(data.message);
              }
              break;
            case "conversation_status":
              if (onStatusUpdateRef.current && data.data) {
                onStatusUpdateRef.current(data.data);
              }
              break;
            case "pong":
              // Handle pong response
              break;
            default:
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
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setConnectionError("Failed to create WebSocket connection");
    }
  }, [conversationId]);

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

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendPing = useCallback(() => {
    sendMessage({ event: "ping" });
  }, [sendMessage]);

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      sendMessage({
        event: "typing",
        data: { is_typing: isTyping },
      });
    },
    [sendMessage]
  );

  const markMessageRead = useCallback(
    (messageId: number) => {
      sendMessage({
        event: "message_read",
        data: { message_id: messageId },
      });
    },
    [sendMessage]
  );

  // Connect/disconnect based on conversationId
  useEffect(() => {
    if (conversationId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [conversationId, connect, disconnect]);

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
    sendTypingIndicator,
    markMessageRead,
    connect,
    disconnect,
  };
};
