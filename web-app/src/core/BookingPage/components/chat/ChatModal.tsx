import React from "react";
import { ChatRoom } from "./ChatRoom";
import { X } from "lucide-react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: number;
  roomId?: number;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  roomId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Chat Support
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat content */}
            <div className="h-96">
              <ChatRoom
                bookingId={bookingId}
                roomId={roomId}
                onClose={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
