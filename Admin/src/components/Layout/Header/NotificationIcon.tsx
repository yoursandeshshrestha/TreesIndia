import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useUnreadCount } from "@/services/api/notifications";
import NotificationDropdown from "./NotificationDropdown";

const NotificationIcon: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: unreadCountData } = useUnreadCount();

  const unreadCount = unreadCountData?.unread_count || 0;

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="relative">
        {/* Notification Icon Button */}
        <button
          onClick={handleToggleDropdown}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell size={20} className="text-gray-600" />
          
          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        <NotificationDropdown
          isOpen={isDropdownOpen}
          onClose={handleCloseDropdown}
        />
      </div>
    </>
  );
};

export default NotificationIcon;
