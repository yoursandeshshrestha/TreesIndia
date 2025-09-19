"use client";

import { useState, useEffect } from "react";
import {
  User,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

export function ProfileOverview() {
  const {
    userProfile,
    isLoadingProfile,
    isUpdatingProfile,
    isUploadingAvatar,
    updateProfileAsync,
    uploadAvatarAsync,
    refetchProfile,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        gender: userProfile.gender || "",
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      await updateProfileAsync({
        name: formData.name,
        email: formData.email || undefined,
        gender: formData.gender || undefined,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
      refetchProfile();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        gender: userProfile.gender || "",
      });
    }
    setIsEditing(false);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      await uploadAvatarAsync(file);
      toast.success("Avatar uploaded successfully");
      refetchProfile();
    } catch {
      toast.error("Failed to upload avatar");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Under Review";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-700 bg-green-100 border-green-300";
      case "rejected":
        return "text-red-700 bg-red-100 border-red-300";
      case "pending":
        return "text-amber-700 bg-amber-100 border-amber-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const getSubscriptionStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Crown className="w-5 h-5 text-green-600" />;
      case "expired":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "expired":
        return "Expired";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Profile Overview
          </h2>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 py-2 text-green-600 hover:text-green-700 cursor-pointer rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-6">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden relative">
              {userProfile?.avatar ? (
                <Image
                  src={userProfile.avatar}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <User className="w-10 h-10 text-blue-600" />
              )}
            </div>
            {!isEditing && (
              <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors z-10">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Profile Summary Details */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {userProfile?.name || ""}
            </h3>
            {userProfile?.user_type && userProfile.user_type !== "normal" && (
              <p className="text-gray-600 text-sm mb-1">
                {userProfile.user_type.charAt(0).toUpperCase() +
                  userProfile.user_type.slice(1)}
              </p>
            )}
            <p className="text-gray-500 text-sm">{userProfile?.phone || ""}</p>
            <p className="text-green-600 text-sm font-medium">
              Wallet Balance: ₹
              {userProfile?.wallet?.balance?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>

        {/* Member Since - Bottom Right */}
        <div className="flex justify-end mt-2">
          <p className="text-gray-500 text-sm">
            Member since{" "}
            {userProfile?.created_at
              ? formatDate(userProfile.created_at)
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name.split(" ")[0] || ""}
                  onChange={(e) => {
                    const lastName =
                      formData.name.split(" ").slice(1).join(" ") || "";
                    setFormData({
                      ...formData,
                      name: `${e.target.value} ${lastName}`.trim(),
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add your name"
                />
              ) : userProfile?.name?.split(" ")[0] ? (
                <p className="font-medium text-gray-900">
                  {userProfile.name.split(" ")[0]}
                </p>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="font-medium text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  Add your name
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add your email"
                />
              ) : userProfile?.email ? (
                <p className="font-medium text-gray-900">{userProfile.email}</p>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="font-medium text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  Add your email
                </button>
              )}
            </div>

            {userProfile?.user_type && userProfile.user_type !== "normal" && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Bio
                </label>
                <p className="text-gray-900 font-medium">
                  {userProfile.user_type.charAt(0).toUpperCase() +
                    userProfile.user_type.slice(1)}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Gender
              </label>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Add your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              ) : userProfile?.gender ? (
                <p className="font-medium text-gray-900">
                  {userProfile.gender.charAt(0).toUpperCase() +
                    userProfile.gender.slice(1).replace("_", " ")}
                </p>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="font-medium text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  Add your gender
                </button>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name.split(" ").slice(1).join(" ") || ""}
                  onChange={(e) => {
                    const firstName = formData.name.split(" ")[0] || "";
                    setFormData({
                      ...formData,
                      name: `${firstName} ${e.target.value}`.trim(),
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add your last name"
                />
              ) : userProfile?.name?.split(" ").slice(1).join(" ") ? (
                <p className="font-medium text-gray-900">
                  {userProfile.name.split(" ").slice(1).join(" ")}
                </p>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="font-medium text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  Add your last name
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone
              </label>
              {userProfile?.phone ? (
                <p className="font-medium text-gray-900">{userProfile.phone}</p>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="font-medium text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  +91 9609321667
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isUpdatingProfile}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isUpdatingProfile ? "Saving..." : "Save Changes"}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdatingProfile}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Subscription Status Card - Only show if there's meaningful subscription data */}
      {userProfile?.subscription &&
        userProfile.subscription.status &&
        (userProfile.subscription.start_date ||
          userProfile.subscription.end_date) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Subscription Status
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Your current subscription details
              </p>
            </div>

            <div className="space-y-4">
              {/* Status Display */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getSubscriptionStatusIcon(userProfile.subscription.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {getSubscriptionStatusText(
                        userProfile.subscription.status
                      )}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {userProfile.subscription.status === "active" &&
                      "Your subscription is currently active and you have access to all premium features."}
                    {userProfile.subscription.status === "expired" &&
                      "Your subscription has expired. Renew to continue enjoying premium features."}
                    {userProfile.subscription.status === "cancelled" &&
                      "Your subscription has been cancelled. You can reactivate it anytime."}
                  </p>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date
                  </label>
                  <p className="font-semibold text-gray-900">
                    {userProfile.subscription.start_date
                      ? formatDate(userProfile.subscription.start_date)
                      : "Not available"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date
                  </label>
                  <p className="font-semibold text-gray-900">
                    {userProfile.subscription.end_date
                      ? formatDate(userProfile.subscription.end_date)
                      : "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Role Application Status Card */}
      {userProfile?.role_application &&
        userProfile.role_application.status &&
        userProfile.role_application.status !== "none" &&
        userProfile.role_application.status !== "" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Role Application Status
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Track your application to become a service provider
              </p>
            </div>

            <div className="space-y-4">
              {/* Status Display */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(userProfile.role_application.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {getStatusText(userProfile.role_application.status)}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                        userProfile.role_application.status
                      )}`}
                    >
                      {userProfile.role_application.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {userProfile.role_application.status === "pending" &&
                      "Your application is currently under review. We'll notify you once a decision is made."}
                    {userProfile.role_application.status === "approved" &&
                      "Congratulations! Your application has been approved. You can now start providing services."}
                    {userProfile.role_application.status === "rejected" &&
                      "Your application was not approved at this time. You may reapply in the future."}
                  </p>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Application Date
                  </label>
                  <p className="font-semibold text-gray-900">
                    {userProfile.role_application.application_date
                      ? formatDate(
                          userProfile.role_application.application_date
                        )
                      : "Not available"}
                  </p>
                </div>

                {userProfile.role_application.approval_date && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Approval Date
                    </label>
                    <p className="font-semibold text-gray-900">
                      {formatDate(userProfile.role_application.approval_date)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
