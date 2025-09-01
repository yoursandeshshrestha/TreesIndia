import React, { useEffect, useState } from "react";
import { useUserChatRooms } from "@/hooks/useChat";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import Image from "next/image";

// Define ChatRoom type locally since we're not using Supabase
interface ChatRoom {
  id: number;
  room_name: string;
  is_active: boolean;
  last_message_at: string | null;
  messages?: Array<{
    id: number;
    message: string;
    created_at: string;
    sender?: {
      ID: number;
      name: string;
      user_type: string;
      avatar?: string;
    };
  }>;
  booking?: {
    booking_reference: string;
    status: string;
    service: {
      name: string;
    };
    user?: {
      ID: number;
      name: string;
      user_type: string;
      avatar?: string;
    };
    worker_assignment?: {
      worker?: {
        ID: number;
        name: string;
        user_type: string;
        avatar?: string;
      };
    };
  };
}

interface ChatListProps {
  onSelectChat?: (chatRoom: ChatRoom) => void;
  onRoomSelect?: (roomId: number) => void;
  selectedChatId?: number;
  selectedRoomId?: number;
}

export const ChatList: React.FC<ChatListProps> = ({
  onSelectChat,
  onRoomSelect,
  selectedChatId,
  selectedRoomId,
}) => {
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  const {
    data: chatRoomsData,
    isLoading,
    error,
    refetch: refetchChatRooms,
  } = useUserChatRooms();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chatRooms = chatRoomsData?.chat_rooms || [];

  const getLastMessage = (chatRoom: ChatRoom) => {
    if (!chatRoom.messages || chatRoom.messages.length === 0) {
      return null;
    }
    return chatRoom.messages[0];
  };

  const getWorkerName = (chatRoom: ChatRoom) => {
    // First try to get worker name from booking assignment
    if (chatRoom.booking?.worker_assignment?.worker?.name) {
      return chatRoom.booking.worker_assignment.worker.name;
    }

    // Fallback to finding worker from messages
    if (chatRoom.messages && chatRoom.messages.length > 0) {
      const workerMessage = chatRoom.messages.find(
        (msg) => msg.sender?.user_type === "worker"
      );
      if (workerMessage?.sender?.name) {
        return workerMessage.sender.name;
      }
    }

    return chatRoom.room_name;
  };

  const getUserName = (chatRoom: ChatRoom) => {
    // Get user name from booking
    if (chatRoom.booking?.user?.name) {
      return chatRoom.booking.user.name;
    }

    // Fallback to finding user from messages
    if (chatRoom.messages && chatRoom.messages.length > 0) {
      const userMessage = chatRoom.messages.find(
        (msg) => msg.sender?.user_type === "normal"
      );
      if (userMessage?.sender?.name) {
        return userMessage.sender.name;
      }
    }

    return "User";
  };

  const getWorkerAvatar = (chatRoom: ChatRoom) => {
    // First try to get worker avatar from booking assignment
    if (chatRoom.booking?.worker_assignment?.worker?.avatar) {
      return chatRoom.booking.worker_assignment.worker.avatar;
    }

    // Fallback to finding worker from messages
    if (chatRoom.messages && chatRoom.messages.length > 0) {
      const workerMessage = chatRoom.messages.find(
        (msg) => msg.sender?.user_type === "worker"
      );
      if (workerMessage?.sender?.avatar) {
        return workerMessage.sender.avatar;
      }
    }

    return null;
  };

  const getUserAvatar = (chatRoom: ChatRoom) => {
    // Get user avatar from booking
    if (chatRoom.booking?.user?.avatar) {
      return chatRoom.booking.user.avatar;
    }

    // Fallback to finding user from messages
    if (chatRoom.messages && chatRoom.messages.length > 0) {
      const userMessage = chatRoom.messages.find(
        (msg) => msg.sender?.user_type === "normal"
      );
      if (userMessage?.sender?.avatar) {
        return userMessage.sender.avatar;
      }
    }

    return null;
  };

  // Show loading state only on client side to prevent hydration mismatch
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-500 mb-2">Failed to load chats</p>
          <p className="text-sm text-gray-500">{error.message}</p>
          <button
            onClick={() => refetchChatRooms()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isClient || chatRooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">
            {!isClient ? "Loading..." : "No chat rooms yet"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {!isClient ? "Please wait..." : "Start a booking to begin chatting"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chatRooms.map((chatRoom) => {
        const lastMessage = getLastMessage(chatRoom);

        // Show appropriate person based on current user role
        const isWorker = (user as any)?.user_type === "worker";
        const personName = isWorker
          ? getUserName(chatRoom)
          : getWorkerName(chatRoom);
        const personAvatar = isWorker
          ? getUserAvatar(chatRoom)
          : getWorkerAvatar(chatRoom);

        return (
          <div
            key={chatRoom.id}
            onClick={() => {
              onSelectChat?.(chatRoom);
              onRoomSelect?.(chatRoom.id);
            }}
            className={`p-4 cursor-pointer transition-colors last:border-b-0 ${
              selectedChatId === chatRoom.id || selectedRoomId === chatRoom.id
                ? "bg-green-50 border-l-4 border-l-green-500"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {personAvatar ? (
                  <Image
                    width={40}
                    height={40}
                    src={personAvatar}
                    alt={personName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                {/* Fallback initials */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm ${
                    personAvatar ? "hidden" : ""
                  }`}
                >
                  {personName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
                    {personName}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {lastMessage
                      ? new Date(lastMessage.created_at).toLocaleTimeString(
                          [],
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )
                      : ""}
                  </span>
                </div>

                {/* Service Info */}
                {chatRoom.booking?.service?.name && (
                  <p className="text-sm text-gray-500 mb-1">
                    {chatRoom.booking.service.name}
                  </p>
                )}

                {/* Last Message */}
                {lastMessage ? (
                  <p className="text-sm text-gray-600 truncate">
                    {lastMessage.message}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">No messages yet</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
