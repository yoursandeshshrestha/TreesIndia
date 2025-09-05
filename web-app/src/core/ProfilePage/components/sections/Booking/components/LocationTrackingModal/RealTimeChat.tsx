"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Send, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useChatMessages, useChatMutations } from "@/hooks/useChat";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/hooks/useChat";

interface RealTimeChatProps {
  roomId: number;
  isConnected?: boolean;
  connectionError?: string | null;
}

export function RealTimeChat({ roomId }: RealTimeChatProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get messages for the room using existing chat hooks
  const { data: messagesData, isLoading: isLoadingMessages } =
    useChatMessages(roomId);

  // Get chat mutations
  const { sendMessage, isSendingMessage } =
    useChatMutations();

  const messages = useMemo(
    () => messagesData?.messages || [],
    [messagesData?.messages]
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket real-time updates using existing chat WebSocket
  const { isConnected: isRealtimeConnected } = useWebSocket({
    roomId: roomId,
    enabled: !!roomId,
    onMessage: useCallback(
      (message: { type: string }) => {
        if (message.type === "message") {
          // Invalidate messages query to refetch
          queryClient.invalidateQueries({
            queryKey: chatKeys.messages(roomId),
          });
        }
      },
      [queryClient, roomId]
    ),
  });

  // Send chat message using existing chat API
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user || isSendingMessage) return;

    try {
      await sendMessage({
        roomId: roomId,
        messageData: {
          message: newMessage.trim(),
          message_type: "text",
        },
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [newMessage, user, roomId, isSendingMessage, sendMessage]);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs text-gray-400">Start a conversation...</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                message.sender_id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.sender_id === user?.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.sender_id !== user?.id && (
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {message.sender?.name || "Unknown User"}
                  </div>
                )}
                <div className="text-sm">{message.message}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.sender_id === user?.id
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.created_at)}
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={!isRealtimeConnected || isSendingMessage}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={
              !newMessage.trim() || !isRealtimeConnected || isSendingMessage
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSendingMessage ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        {!isRealtimeConnected && (
          <p className="text-xs text-red-600 mt-2">
            Cannot send messages while disconnected
          </p>
        )}
      </div>
    </div>
  );
}
