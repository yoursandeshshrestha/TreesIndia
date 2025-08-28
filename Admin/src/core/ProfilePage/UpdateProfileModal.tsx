"use client";

import React, { useState } from "react";
import { X, Upload, User } from "lucide-react";
import Image from "next/image";
import type { User as UserType } from "@/types/api";

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdate: (updatedUser: Partial<UserType>) => void;
}

const isBase64Image = (src: string): boolean => {
  return src.startsWith("data:image/");
};

const renderAvatar = (src: string, alt: string) => {
  if (isBase64Image(src)) {
    return <img src={src} alt={alt} className="w-full h-full object-cover" />;
  }
  return (
    <Image
      width={64}
      height={64}
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
    />
  );
};

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
}) => {
  const [firstName, setFirstName] = useState(user.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(
    user.name?.split(" ").slice(1).join(" ") || ""
  );
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar || null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedData: Partial<UserType> = {
        name: `${firstName} ${lastName}`.trim(),
      };

      // Upload avatar if changed
      if (avatar) {
        const formData = new FormData();
        formData.append("avatar", avatar);

        const uploadResponse = await fetch("/api/users/upload-avatar", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          updatedData.avatar = uploadData.avatar;
        }
      }

      // Update profile
      const profileResponse = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (profileResponse.ok) {
        onUpdate(updatedData);
        onClose();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = (name?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#212126]">
            Update profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  renderAvatar(avatarPreview, "Profile avatar")
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {getUserInitials(user.name)}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Upload
                  </button>
                </label>
                <button
                  onClick={handleRemoveAvatar}
                  className="block text-red-600 text-sm hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Recommended size 1:1, up to 10MB
            </p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#212126] mb-2">
                Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#212126] mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add your last name"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="text-[#212126] hover:text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
