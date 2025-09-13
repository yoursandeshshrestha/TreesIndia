import { useEffect, useRef, useState, useCallback } from "react";
import { conversationStore } from "@/utils/conversationStore";

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

      // User WebSocket URL for monitoring conversations
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
      const wsUrl = `${baseUrl}/api/v1/ws/conversations/monitor?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Send a test message to verify connection
        ws.send(JSON.stringify({ event: "test_connection" }));

        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: "ping" }));
          }
        }, 30000); // Ping every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.event === "conversation_message") {
            // Handle new message
            if (onMessageRef.current) {
              onMessageRef.current(message);
            }
            // Emit to global store for other components
            conversationStore.emitUpdate(
              message as unknown as {
                event: string;
                conversation_id: number;
                message: {
                  id: number;
                  message: string;
                  created_at: string;
                  sender_id: number;
                  sender?: { user_type: string };
                };
              }
            );
          } else if (message.event === "conversation_read") {
            // Handle read status update
            conversationStore.emitReadStatusUpdate(
              (message as unknown as { conversation_id: number })
                .conversation_id
            );
          } else if (message.event === "total_unread_count") {
            // Handle total unread count update from backend
            if (message.data && onTotalUnreadCountRef.current) {
              const countData = message.data as { total_unread_count: number };
              onTotalUnreadCountRef.current(countData.total_unread_count);
            }
            // Also emit to global store
            if (message.data) {
              const countData = message.data as { total_unread_count: number };
              conversationStore.emitTotalUnreadCountUpdate(
                countData.total_unread_count
              );
            }
          } else if (message.event === "conversation_unread_count") {
            // Handle individual conversation unread count update
            if (message.data && onConversationUnreadCountRef.current) {
              const countData = message.data as {
                conversation_id: number;
                unread_count: number;
              };
              onConversationUnreadCountRef.current(
                countData.conversation_id,
                countData.unread_count
              );
            }
            // Also emit to global store
            if (message.data) {
              const countData = message.data as {
                conversation_id: number;
                unread_count: number;
              };
              // Emit conversation unread count update to global store
              conversationStore.emitConversationUnreadCountUpdate(
                countData.conversation_id,
                countData.unread_count
              );
            }
          } else if (message.event === "pong") {
            // Handle pong response
          } else if (message.event === "test_connection_response") {
            // Handle test connection response
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

        // Attempt to reconnect if not a clean close
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

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
  };
};
