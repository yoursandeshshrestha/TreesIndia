import React from "react";
import { User } from "lucide-react";
import Image from "next/image";
import { useAppSelector } from "@/app/store";
import {
  selectUser,
  selectUserLoading,
  selectUserName,
  selectUserEmail,
  selectUserAvatar,
} from "@/app/store/slices";
import Spinner from "@/components/Loader/Spinner/Spinner";

const ProfileCard: React.FC = () => {
  const userData = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectUserLoading);
  const userName = useAppSelector(selectUserName);
  const userEmail = useAppSelector(selectUserEmail);
  const userAvatar = useAppSelector(selectUserAvatar);

  if (isLoading) {
    return (
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-white">
          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
            <Spinner size="sm" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-white">
          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
            <User size={20} className="text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">User</p>
            <p className="text-xs text-gray-500 truncate">
              Unable to load profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Use the values from selectors

  return (
    <div className="p-3  bg-gray-50/50">
      <div className="flex items-center space-x-3 p-1 rounded-lg bg-white">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {userAvatar ? (
            <Image
              width={32}
              height={32}
              src={userAvatar}
              alt={userName}
              className="w-8 h-8  object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <User size={20} className="text-gray-500" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 font-mono">
          <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
