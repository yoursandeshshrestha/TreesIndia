import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatModal } from "./ChatModal";

interface ChatButtonProps {
  bookingId?: number;
  roomId?: number;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  bookingId,
  roomId,
  className = "",
  variant = "default",
  size = "md",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className={buttonClasses}>
        <MessageCircle className="w-4 h-4 mr-2" />
        Chat
      </button>

      <ChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingId={bookingId}
        roomId={roomId}
      />
    </>
  );
};
