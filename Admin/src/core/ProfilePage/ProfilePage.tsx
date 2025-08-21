"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileLayout from "@/core/ProfileLayout";
import { useUserState } from "@/hooks/useUserState";

const ProfilePage: React.FC = () => {
  const {
    user: userData,
    isLoading,
    error,
    updateAvatar,
    updateUserData,
  } = useUserState();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(false);
  const [isEmailUpdateOpen, setIsEmailUpdateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isEmailUpdating, setIsEmailUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Profile
          </h2>
          <p className="text-gray-600">
            Failed to load user profile information.
          </p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            No Profile Data
          </h2>
          <p className="text-gray-600">
            No user profile information available.
          </p>
        </div>
      </div>
    );
  }

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

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarUploadSuccess(false);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Automatically upload avatar when selected
      setIsAvatarUploading(true);
      try {
        await updateAvatar(file);

        // Show success state
        setAvatarUploadSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setAvatarUploadSuccess(false);
        }, 3000);
      } catch (error) {
        console.error("Error uploading avatar:", error);
        // You might want to show an error message to the user here
      } finally {
        setIsAvatarUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!userData) return;

    setIsUploading(true);
    try {
      // Merge first name and last name
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // Update profile if name changed
      if (fullName !== userData.name) {
        await updateUserData({
          name: fullName,
        });
      }

      // Avatar is already uploaded when selected, so no need to upload again

      // Close form and reset state
      setIsUpdateModalOpen(false);
      setFirstName("");
      setLastName("");
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsUpdateModalOpen(false);
    setFirstName("");
    setLastName("");
    setAvatarPreview(null);
  };

  const handleEmailUpdate = async () => {
    if (!userData || !newEmail.trim()) return;

    setIsEmailUpdating(true);
    try {
      await updateUserData({
        email: newEmail.trim(),
      });

      // Close form and reset state
      setIsEmailUpdateOpen(false);
      setNewEmail("");
    } catch (error) {
      console.error("Error updating email:", error);
    } finally {
      setIsEmailUpdating(false);
    }
  };

  const handleEmailCancel = () => {
    setIsEmailUpdateOpen(false);
    setNewEmail("");
  };

  const handleOpenEmailForm = () => {
    setNewEmail("");
    setIsEmailUpdateOpen(true);
  };

  // Initialize form fields when form opens
  const handleOpenForm = () => {
    if (userData) {
      const nameParts = userData.name?.split(" ") || [];
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
    }
    setIsUpdateModalOpen(true);
  };

  return (
    <ProfileLayout>
      <div className="space-y-4 ">
        <div className="pb-4 border-b border-gray-200">
          <h2 className="text-[17px] font-semibold text-[#212126]">
            Profile details
          </h2>
        </div>

        <div className="space-y-2">
          {/* Profile Section */}
          <div className="flex items-start justify-between py-3">
            <span className="text-[#212126] font-medium">Profile</span>
            {!isUpdateModalOpen ? (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {userData.avatar ? (
                    <Image
                      width={48}
                      height={48}
                      src={userData.avatar}
                      alt={`${userData.name || "User"} avatar`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {getUserInitials(userData.name)}
                    </span>
                  )}
                </div>
                <span className="text-[#212126] font-medium">
                  {userData.name || "No Name"}
                </span>
              </div>
            ) : (
              <AnimatePresence>
                {isUpdateModalOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-[70%] bg-white border border-gray-200 shadow-lg rounded-lg"
                  >
                    <div className="p-3 space-y-6">
                      <h3 className="text-lg font-medium text-[#212126]">
                        Update profile
                      </h3>

                      {/* Profile Picture Section */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                            {avatarPreview ? (
                              renderAvatar(
                                avatarPreview,
                                "Profile avatar preview"
                              )
                            ) : userData.avatar ? (
                              renderAvatar(userData.avatar, "Profile avatar")
                            ) : (
                              <span className="text-white font-semibold text-lg">
                                {getUserInitials(userData.name)}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="block">
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                className="hidden"
                                id="avatar-upload"
                                onChange={handleAvatarChange}
                                disabled={isAvatarUploading}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  document
                                    .getElementById("avatar-upload")
                                    ?.click()
                                }
                                disabled={isAvatarUploading}
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAvatarUploading ? "Uploading..." : "Upload"}
                              </button>
                            </label>
                            {avatarUploadSuccess && (
                              <p className="text-xs text-green-600">
                                ✓ Avatar uploaded successfully!
                              </p>
                            )}
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
                            First name
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#212126] mb-2">
                            Last name
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-4 pt-4">
                        <button
                          onClick={handleCancel}
                          className="text-[#212126] hover:text-gray-700 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-6 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"
                          disabled={isUploading}
                        >
                          {isUploading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            {!isUpdateModalOpen && (
              <button
                onClick={handleOpenForm}
                className="text-[#212126] hover:text-gray-700 font-medium"
              >
                Update profile
              </button>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Email Addresses */}
          <div>
            <div className="flex items-center justify-between py-4">
              <span className="text-[#212126] font-medium">
                Email addresses
              </span>
              <div className="flex items-center space-x-3">
                <span className="text-[#212126] font-normal text-[14px]">
                  {userData.email || "No email provided"}
                </span>
                <span className="px-2 py-[2px] bg-gray-100 border border-gray-200 text-black text-xs rounded-sm">
                  Primary
                </span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center">
              {!isEmailUpdateOpen && (
                <button
                  onClick={handleOpenEmailForm}
                  className="flex items-center cursor-pointer space-x-2 text-[#212126] hover:text-gray-700"
                >
                  <Plus className="w-3 h-3" />
                  <span className="text-sm">Add email address</span>
                </button>
              )}
            </div>

            {/* Add Email Form */}
            <AnimatePresence>
              {isEmailUpdateOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-[70%] bg-white border border-gray-200 shadow-lg rounded-lg ml-auto"
                >
                  <div className="p-3 space-y-4">
                    <h4 className="text-md font-medium text-[#212126]">
                      Add new email address
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-[#212126] mb-2">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new email address"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-2">
                      <button
                        onClick={handleEmailCancel}
                        className="text-[#212126] hover:text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEmailUpdate}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"
                        disabled={isEmailUpdating}
                      >
                        {isEmailUpdating ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
