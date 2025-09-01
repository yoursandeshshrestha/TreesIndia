import React from "react";
import { ChatMessage } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  isLastMessage?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLastMessage = false,
}) => {
  const { user } = useAuth();
  const isOwnMessage = user?.id === message.sender_id;

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "12:00 PM";
    }
  };

  const getMessageStatus = () => {
    if (!isOwnMessage) return null;

    if (message.is_read) {
      return <CheckCheck className="w-3 h-3 text-green-500" />;
    } else if (message.status === "delivered") {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    } else {
      return <Check className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`flex max-w-xs lg:max-w-md ${
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Message Content */}
        <div
          className={`flex flex-col ${
            isOwnMessage ? "items-end" : "items-start"
          }`}
        >
          {/* Sender Name (only for other users) */}
          {!isOwnMessage && message.sender && (
            <span className="text-xs text-gray-500 mb-1 px-2">
              {message.sender.name}
            </span>
          )}

          {/* Message Bubble */}
          <div
            className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md break-words ${
              isOwnMessage
                ? "bg-green-500 text-white rounded-br-md"
                : "bg-gray-100 text-gray-900 rounded-bl-md"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          </div>

          {/* Message Meta */}
          <div
            className={`flex items-center mt-1 ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            <span className="text-xs text-gray-400 mr-1">
              {formatTime(message.created_at)}
            </span>
            {getMessageStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};
