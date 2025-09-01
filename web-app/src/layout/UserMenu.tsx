"use client";

import React from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { useRouter } from "next/navigation";

export const UserMenu: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();

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
        <div className="flex items-center space-x-4">
          {/* My Bookings/My Work Button */}
          <button
            onClick={() =>
              router.push(
                user.user_type === "worker"
                  ? "/profile/my-work"
                  : "/profile/my-bookings"
              )
            }
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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

          {/* User Menu Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-black" />
              </div>
              <span className="text-sm font-medium text-gray-700">
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

            {/* Dropdown Menu */}
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

                <button
                  onClick={() => router.push("/chat")}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <MessageCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Messages</span>
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
      ) : (
        <button
          onClick={() => dispatch(openAuthModal({}))}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">Sign In</span>
        </button>
      )}
    </>
  );
};
