import React, { useState, useRef, useEffect } from "react";
import { useAdminChat } from "@/hooks/useAdminChat";
import {
  Send,
  MessageCircle,
  Wifi,
  WifiOff,
  Loader2,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AdminChatRoomProps {
  roomId?: number;
  onClose?: () => void;
}

export const AdminChatRoom: React.FC<AdminChatRoomProps> = ({
  roomId,
  onClose,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    chatRooms,
    isLoadingMessages,
    isSendingMessage,
    sendMessage,
    closeRoom,
    isClosingRoom,
    sendMessageError,
    closeRoomError,
  } = useAdminChat(roomId);

  const currentRoom = chatRooms.find((room) => room.id === roomId);

  const handleSendMessage = () => {
    if (newMessage.trim() && roomId) {
      sendMessage({
        roomId,
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

  const handleCloseRoom = () => {
    if (roomId && currentRoom?.is_active) {
      if (confirm("Are you sure you want to close this chat room?")) {
        closeRoom(roomId);
        toast.success("Chat room closed successfully");
      }
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show loading state
  if (isLoadingMessages && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-gray-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Show no room selected state
  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Select a chat room to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {currentRoom?.room_name || "Chat Room"}
            </h3>
            {currentRoom?.booking && (
              <p className="text-sm text-gray-500">
                Booking #{currentRoom.booking.booking_reference}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                  currentRoom?.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {currentRoom?.is_active ? "Active" : "Closed"}
              </span>
              {!currentRoom?.is_active && (
                <span className="text-xs text-gray-500">
                  {currentRoom?.closed_reason || "Service completed"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Connection status */}
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <Wifi className="w-3 h-3" />
            <span>Connected</span>
          </div>

          {/* Close room button (admin only) */}
          {currentRoom?.is_active && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseRoom}
              disabled={isClosingRoom}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Lock className="w-3 h-3 mr-1" />
              Close Room
            </Button>
          )}

          {/* Close button */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

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
            <div
              key={message.id}
              className={`flex ${
                message.sender?.user_type === "admin"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender?.user_type === "admin"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.sender?.name || "Unknown"}
                </div>
                <div className="text-sm">{message.message}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.sender?.user_type === "admin"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={!currentRoom?.is_active || isSendingMessage}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={
              !currentRoom?.is_active || isSendingMessage || !newMessage.trim()
            }
            className="px-4 py-2"
          >
            {isSendingMessage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Error messages */}
        {sendMessageError && (
          <p className="text-red-500 text-sm mt-2">
            Failed to send message: {sendMessageError.message}
          </p>
        )}
        {closeRoomError && (
          <p className="text-red-500 text-sm mt-2">
            Failed to close room: {closeRoomError.message}
          </p>
        )}
        {!currentRoom?.is_active && (
          <p className="text-yellow-600 text-sm mt-2">
            This chat room is closed. No new messages can be sent.
          </p>
        )}
      </div>
    </div>
  );
};
