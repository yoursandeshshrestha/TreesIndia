import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { conversationStore } from "@/utils/conversationStore";

interface WebSocketMessage {
  event: "conversation_message" | "typing" | "status_update" | "ping" | "pong";
  data?: Record<string, unknown>;
  conversation_id?: number;
  message?: Record<string, unknown>;
  user_id?: number;
  is_typing?: boolean;
}

interface UseSimpleConversationWebSocketProps {
  conversationId: number | null;
  enabled?: boolean;
  onMessage?: (message: Record<string, unknown>) => void;
  onStatusUpdate?: (status: Record<string, unknown>) => void;
  onTyping?: (userId: number, isTyping: boolean) => void;
  isConversationOpen?: boolean; // Add flag to indicate if conversation is currently open
}

export function useSimpleConversationWebSocket({
  conversationId,
  enabled = true,
  onMessage,
  onStatusUpdate,
  onTyping,
  isConversationOpen = false,
}: UseSimpleConversationWebSocketProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Callback refs to avoid stale closures
  const onMessageRef = useRef(onMessage);
  const onStatusUpdateRef = useRef(onStatusUpdate);
  const onTypingRef = useRef(onTyping);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onStatusUpdateRef.current = onStatusUpdate;
  }, [onStatusUpdate]);

  useEffect(() => {
    onTypingRef.current = onTyping;
  }, [onTyping]);

  const connect = useCallback(() => {
    if (!enabled || !conversationId || !user?.id) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
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
        setIsConnecting(false);
        return;
      }

      // Connect to simple conversation WebSocket endpoint with proper authentication
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
      const wsUrl = `${baseUrl}/api/v1/ws/conversations/connect?token=${token}&conversation_id=${conversationId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: "ping" }));
          }
        }, 30000); // Ping every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.event) {
            case "conversation_message":
              if (message.message) {
                onMessageRef.current?.(message.message);
              }
              // Note: Unread count updates are handled by the monitor WebSocket connection
              // (useConversationWebSocket) which receives authoritative total_unread_count events
              // from the backend. This prevents race conditions and ensures consistency.
              break;
            case "typing":
              if (message.user_id && typeof message.is_typing === "boolean") {
                onTypingRef.current?.(message.user_id, message.is_typing);
              }
              break;
            case "status_update":
              if (message.data) {
                onStatusUpdateRef.current?.(message.data);
              }
              break;
            case "pong":
              // Handle pong response
              break;
            default:
              console.log("Unknown WebSocket message event:", message.event);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);

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
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError("Failed to reconnect after multiple attempts");
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnecting(false);
        setConnectionError("WebSocket connection error");
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setIsConnecting(false);
      setConnectionError("Failed to create WebSocket connection");
    }
  }, [enabled, conversationId, user?.id, isConversationOpen]);

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
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
    reconnectAttempts.current = 0;
  }, []);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "typing",
          data: {
            is_typing: isTyping,
          },
        })
      );
    }
  }, []);

  const markMessageRead = useCallback((messageId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "message_read",
          data: {
            message_id: messageId,
          },
        })
      );
    }
  }, []);

  // Connect/disconnect based on enabled state and conversationId
  useEffect(() => {
    if (enabled && conversationId && user?.id) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, conversationId, user?.id, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    connectionError,
    sendTypingIndicator,
    markMessageRead,
    connect,
    disconnect,
  };
}
