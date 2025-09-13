import React from "react";
import {
  X,
  Mail,
  Phone,
  Wallet,
  Clock,
  User,
  Shield,
  Copy,
} from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Image from "next/image";
import { User as UserType, UserType as UserTypeEnum } from "@/types/user";
import {
  getUserTypeIcon,
  getUserTypeColor,
  getStatusColor,
  formatCurrency,
  formatDate,
  formatUserType,
  formatGender,
  getDaysRemaining,
  getAvailableCredit,
} from "@/utils/userUtils";

interface UserPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

const isBase64Image = (src: string): boolean => {
  return src.startsWith("data:image/");
};

const renderAvatar = (src: string, alt: string, size: number = 96) => {
  if (isBase64Image(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-24 w-24 rounded-full object-cover"
      />
    );
  }
  return (
    <Image
      className="h-24 w-24 rounded-full"
      src={src}
      width={size}
      height={size}
      alt={alt}
    />
  );
};

const UserPreviewModal: React.FC<UserPreviewModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen || !user) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if you have one
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getUserTypeBadge = (userType: UserTypeEnum) => {
    const IconComponent = getUserTypeIcon(userType);
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUserTypeColor(
          userType
        )}`}
      >
        <IconComponent className="h-5 w-5" />
        <span className="ml-2">{formatUserType(userType)}</span>
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
          isActive
        )}`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Header */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="flex-shrink-0">
              {user.avatar ? (
                renderAvatar(user.avatar, user.name)
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-3xl font-medium text-gray-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {user.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                {getUserTypeBadge(user.user_type)}
                {getStatusBadge(user.is_active)}
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {user.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                  <button
                    onClick={() => copyToClipboard(user.phone)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copy phone number"
                  >
                    <Copy className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
                {user.gender && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="capitalize">
                      {formatGender(user.gender)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Wallet className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Wallet Information
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance:</span>
                  <span className="font-semibold">
                    {formatCurrency(user.wallet_balance)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Available Credit:</span>
                  <span className="font-semibold">
                    {formatCurrency(getAvailableCredit(user))}
                  </span>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Subscription Information
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-semibold ${
                      user.has_active_subscription
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {user.has_active_subscription ? "Active" : "Inactive"}
                  </span>
                </div>
                {user.subscription_expiry_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span className="font-semibold">
                      {formatDate(user.subscription_expiry_date)}
                    </span>
                  </div>
                )}
                {user.has_active_subscription &&
                  user.subscription_expiry_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Remaining:</span>
                      <span className="font-semibold">
                        {getDaysRemaining(user.subscription_expiry_date)}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Account Information
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-semibold">#{user.ID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User Type:</span>
                  <span className="font-semibold capitalize">
                    {user.user_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Status:</span>
                  <span
                    className={`font-semibold ${
                      user.is_active ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Timestamps
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold">
                    {formatDate(user.CreatedAt, true)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-semibold">
                    {formatDate(user.UpdatedAt, true)}
                  </span>
                </div>
                {user.last_login_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-semibold">
                      {formatDate(user.last_login_at, true)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreviewModal;
