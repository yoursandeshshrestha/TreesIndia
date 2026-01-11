"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  LogOut,
  Settings,
  Wallet,
  Calendar,
  User as UserIcon,
  Briefcase,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { openChatModal } from "@/store/slices/chatModalSlice";
import { conversationStore } from "@/utils/conversationStore";
import { useGlobalWebSocket } from "@/components/GlobalWebSocketProvider/GlobalWebSocketProvider";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  isMobileMenuContext?: boolean;
  onMenuClose?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  isMobileMenuContext = false,
  onMenuClose,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  // Get global WebSocket state and unread count
  const { totalUnreadCount } = useGlobalWebSocket();
  const [currentlyOpenConversationId, setCurrentlyOpenConversationId] =
    useState<number | null>(null);

  // Subscribe to open conversation changes
  useEffect(() => {
    const unsubscribeOpenConversation =
      conversationStore.subscribeToOpenConversation((conversationId) => {
        setCurrentlyOpenConversationId(conversationId);
      });
    return () => {
      unsubscribeOpenConversation();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const formatPhone = (phone: string) => {
    // Format +919876543210 to +91 98765 43210
    return phone.replace(/(\+91)(\d{5})(\d{5})/, "$1 $2 $3");
  };

  return (
    <>
      {isAuthenticated && user ? (
        <>
          {/* Mobile Menu Context - Show all items in vertical layout */}
          {isMobileMenuContext ? (
            <div className="w-full space-y-3">
              {/* 1. Profile access with user info display */}
              <div className="w-full flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 text-base">
                    {user.name || "User"}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/profile");
                        onMenuClose?.();
                      }}
                      className="hover:text-green-600 transition-colors cursor-pointer"
                    >
                      {formatPhone(user.phone)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. My Bookings/My Work Button */}
              <button
                onClick={() => {
                  router.push(
                    user.user_type === "worker"
                      ? "/profile/my-work"
                      : "/profile/my-bookings"
                  );
                  onMenuClose?.();
                }}
                className="w-full flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                {user.user_type === "worker" ? (
                  <Briefcase className="w-5 h-5 text-gray-600" />
                ) : (
                  <Calendar className="w-5 h-5 text-gray-600" />
                )}
                <span className="text-base font-medium text-gray-900">
                  {user.user_type === "worker" ? "My Work" : "My Bookings"}
                </span>
              </button>

              {/* 3. Notifications */}
              <button className="w-full flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <span className="text-base font-medium text-gray-900">
                  Notifications
                </span>
              </button>

              {/* 4. Messages button with unread count */}
              <button
                onClick={() => {
                  dispatch(openChatModal());
                  onMenuClose?.();
                }}
                className="w-full flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left relative"
              >
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <span className="text-base font-medium text-gray-900">
                  Messages
                </span>
                {totalUnreadCount > 0 &&
                  currentlyOpenConversationId === null && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </span>
                  )}
              </button>

              {/* 5. Profile button */}
              <button
                onClick={() => {
                  router.push("/profile");
                  onMenuClose?.();
                }}
                className="w-full flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span className="text-base font-medium text-gray-900">
                  Profile
                </span>
              </button>

              {/* 6. Settings button */}
              <button className="w-full flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-base font-medium text-gray-900">
                  Settings
                </span>
              </button>

              {/* 7. Sign out button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-base font-medium text-red-600">
                  Sign Out
                </span>
              </button>
            </div>
          ) : (
            /* Desktop Layout */
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* My Bookings/My Work Button - Desktop only */}
              <button
                onClick={() =>
                  router.push(
                    user.user_type === "worker"
                      ? "/profile/my-work"
                      : "/profile/my-bookings"
                  )
                }
                className="hidden lg:flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {user.user_type === "worker" ? (
                  <Briefcase className="w-4 h-4" />
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {user.user_type === "worker" ? "My Work" : "My Bookings"}
                </span>
              </button>

              {/* Notifications - Desktop */}
              <div className="hidden lg:block">
              </div>
              <div className="lg:hidden">
              </div>

              {/* Chat Button - Desktop only */}
              <button
                onClick={() => dispatch(openChatModal())}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Messages</span>
                {totalUnreadCount > 0 &&
                  currentlyOpenConversationId === null && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </span>
                  )}
              </button>

              {/* User Menu Dropdown - Desktop */}
              <div className="relative group">
                <button className="flex items-center space-x-1 p-1 lg:p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center bg-blue-600">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {user.name || (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push("/profile");
                        }}
                        className="hover:text-green-600 transition-colors cursor-pointer"
                      >
                        {formatPhone(user.phone)}
                      </span>
                    )}
                  </span>
                </button>

                {/* Dropdown Menu - Desktop only */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.name || ""}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span
                            onClick={() => router.push("/profile")}
                            className="hover:text-green-600 transition-colors cursor-pointer"
                          >
                            {formatPhone(user.phone)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          Wallet Balance
                        </span>
                      </div>
                      <span className="font-medium text-green-600">
                        ₹{user.wallet_balance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => router.push("/profile")}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <UserIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Profile</span>
                    </button>

                    <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Settings</span>
                    </button>

                    <div className="border-t border-gray-100 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => dispatch(openAuthModal({}))}
          className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">Sign In</span>
        </button>
      )}
    </>
  );
};
