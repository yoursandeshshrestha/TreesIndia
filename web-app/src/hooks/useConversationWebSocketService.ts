import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { conversationWebSocketService } from "@/services/conversationWebSocketService";

interface UseConversationWebSocketServiceProps {
  onMessage?: (message: unknown) => void;
  onStatusUpdate?: (status: unknown) => void;
  onTotalUnreadCount?: (count: number) => void;
  onConversationUnreadCount?: (conversationId: number, count: number) => void;
}

export const useConversationWebSocketService = ({
  onMessage,
  onStatusUpdate,
  onTotalUnreadCount,
  onConversationUnreadCount,
}: UseConversationWebSocketServiceProps = {}) => {
  const { user, token, isAuthenticated } = useAuth();

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

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && token) {
      conversationWebSocketService.connect(token);
    } else {
      conversationWebSocketService.disconnect();
    }

    return () => {
      conversationWebSocketService.disconnect();
    };
  }, [isAuthenticated, user, token]);

  return {
    isConnected: conversationWebSocketService.isConnected,
    connect: (token: string) => conversationWebSocketService.connect(token),
    disconnect: () => conversationWebSocketService.disconnect(),
    send: (message: Record<string, unknown>) =>
      conversationWebSocketService.send(message),
  };
};
