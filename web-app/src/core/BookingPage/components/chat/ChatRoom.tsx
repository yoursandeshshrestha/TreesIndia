import React, { useState, useRef } from "react";
import {
  useChatMessages,
  useBookingChatRoom,
  useChatMutations,
  chatKeys,
  useUserChatRooms,
} from "@/hooks/useChat";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { WebSocketMessage } from "@/hooks/useWebSocket";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

// Extended booking type for chat room
interface ExtendedBooking {
  id: number;
  booking_reference: string;
  status: string;
  user: {
    id: number;
    name: string;
    phone: string;
    avatar?: string;
  };
  service: {
    id: number;
    name: string;
  };
  worker_assignment?: {
    worker: {
      id: number;
      name: string;
      phone: string;
      avatar?: string;
    };
  };
}

interface ChatRoomProps {
  bookingId?: number;
  roomId?: number;
  onClose?: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ bookingId, roomId }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get messages for the room
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useChatMessages(roomId || 0);

  // Get booking chat room
  const {
    data: bookingChatRoomData,
    isLoading: isLoadingBookingChatRoom,
    error: bookingChatRoomError,
  } = useBookingChatRoom(bookingId || 0);

  // Get chat room data (when we have roomId but no bookingId)
  const {
    data: chatRoomData,
    isLoading: isLoadingChatRoom,
    error: chatRoomError,
  } = useUserChatRooms();

  // Get mutations
  const { sendMessage, sendMessageError } = useChatMutations();

  const messages = messagesData?.messages || [];

  // Get chat room data - prioritize booking chat room, then find by roomId
  let chatRoom = bookingChatRoomData?.chat_room;
  if (!chatRoom && roomId && chatRoomData?.chat_rooms) {
    chatRoom = chatRoomData.chat_rooms.find((room) => room.id === roomId);
  }

  const isLoading =
    isLoadingMessages || isLoadingBookingChatRoom || isLoadingChatRoom;
  const error =
    messagesError || bookingChatRoomError || chatRoomError || sendMessageError;

  // WebSocket real-time updates
  const currentRoomId = roomId || chatRoom?.id;
  const queryClient = useQueryClient();

  const { isConnected } = useWebSocket({
    roomId: currentRoomId,
    enabled: !!currentRoomId,
    onMessage: useCallback(
      (message: WebSocketMessage) => {
        if (message.type === "message") {
          // Invalidate messages query to refetch
          queryClient.invalidateQueries({
            queryKey: chatKeys.messages(currentRoomId!),
          });
        }
      },
      [queryClient, currentRoomId]
    ),
  });

  const handleSendMessage = () => {
    const currentRoomId = roomId || chatRoom?.id;
    if (newMessage.trim() && !isLoading && currentRoomId) {
      sendMessage({
        roomId: currentRoomId,
        messageData: {
          message: newMessage.trim(),
          message_type: "text",
        },
      });
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show loading state
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-green-500" />
          <p className="text-gray-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-500 mb-2">Failed to load chat</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  // Show waiting state (no chat room yet)
  if (!chatRoom && bookingId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">
            Waiting for worker to accept assignment...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Chat will be available once a worker accepts your booking
          </p>
        </div>
      </div>
    );
  }

  // Show closed chat state
  if (chatRoom && !chatRoom.is_active) {
    return (
      <div className="flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLastMessage={index === messages.length - 1}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Closed chat notice */}
        <div className="p-4 border-t bg-gray-50">
          <div className="text-center text-gray-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium">Chat closed</p>
            <p className="text-sm">
              {chatRoom.closed_reason || "Service completed"}
            </p>
            {chatRoom.closed_at && (
              <p className="text-xs mt-1">
                Closed {new Date(chatRoom.closed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Booking Info Header */}
      {chatRoom?.booking && (
        <div className="p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="font-semibold text-green-900">
                Booking #{chatRoom.booking.booking_reference}
              </h3>

              {/* Show appropriate person based on current user role */}
              {user?.user_type === "worker"
                ? // For workers: show user info
                  chatRoom.booking?.user && (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {(chatRoom.booking as ExtendedBooking).user?.avatar ? (
                          <Image
                            width={32}
                            height={32}
                            src={
                              (chatRoom.booking as ExtendedBooking).user.avatar!
                            }
                            alt={
                              (chatRoom.booking as ExtendedBooking).user.name
                            }
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {(chatRoom.booking as ExtendedBooking).user?.name
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {(chatRoom.booking as ExtendedBooking).user?.name ||
                          "User"}
                      </span>
                    </div>
                  )
                : // For users: show worker info
                  (chatRoom.booking as ExtendedBooking)?.worker_assignment
                    ?.worker && (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {(chatRoom.booking as ExtendedBooking).worker_assignment
                          ?.worker?.avatar ? (
                          <Image
                            width={32}
                            height={32}
                            src={
                              (chatRoom.booking as ExtendedBooking)
                                .worker_assignment!.worker.avatar!
                            }
                            alt={
                              (chatRoom.booking as ExtendedBooking)
                                .worker_assignment!.worker.name!
                            }
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {(
                              chatRoom.booking as ExtendedBooking
                            ).worker_assignment?.worker?.name
                              ?.charAt(0)
                              .toUpperCase() || "W"}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {
                          (chatRoom.booking as ExtendedBooking)
                            .worker_assignment?.worker?.name
                        }
                      </span>
                    </div>
                  )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLastMessage={index === messages.length - 1}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {/* Connection status */}
        <div className="flex items-center justify-center mb-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs text-gray-500 ml-2">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={
              isLoading || !newMessage.trim() || !(roomId || chatRoom?.id)
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Error status */}
        {error && (
          <div className="mt-2">
            <p className="text-red-500 text-xs">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
