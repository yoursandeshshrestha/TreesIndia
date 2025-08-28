"use client";

import React, { useState } from "react";
import { Bell, User, ChevronRight, ArrowLeft } from "lucide-react";
import { NotificationSettingsSection } from "./NotificationSettingsSection";
import { toast } from "sonner";
import { requestDeleteOTP, deleteAccount } from "@/lib/profileApi";

type SettingsTab = "notifications" | "account";

export function SettingsSection() {
  const [activeTab, setActiveTab] = useState<SettingsTab | null>(null);

  const settingsTabs = [
    {
      id: "notifications" as SettingsTab,
      title: "Notifications",
      description: "Manage your notification preferences",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "account" as SettingsTab,
      title: "Account",
      description: "Manage your account settings",
      icon: <User className="w-5 h-5" />,
    },
  ];

  const renderActiveSection = () => {
    switch (activeTab) {
      case "notifications":
        return <NotificationSettingsSection />;
      case "account":
        return <AccountSection />;
      default:
        return null;
    }
  };

  const getSectionTitle = () => {
    const tab = settingsTabs.find((t) => t.id === activeTab);
    return tab ? tab.title : "";
  };

  // If we're inside a section, show the section content with back button
  if (activeTab) {
    return (
      <div className="space-y-6">
        {/* Back Button and Section Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Settings</span>
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {getSectionTitle()}
          </h2>
          <p className="text-gray-600 mt-1">
            {activeTab === "notifications" &&
              "Manage your notification preferences"}
            {activeTab === "account" && "Manage your account settings"}
          </p>
        </div>

        {/* Section Content */}
        {renderActiveSection()}
      </div>
    );
  }

  // Main settings menu
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and privacy
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {settingsTabs.map((tab, index) => (
          <div key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-gray-600">{tab.icon}</div>
                <div className="text-left">
                  <h3 className="font-semibold text-base text-gray-900">
                    {tab.title}
                  </h3>
                  <p className="text-sm text-gray-600">{tab.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            {index < settingsTabs.length - 1 && (
              <div className="border-b border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Account Section Component
function AccountSection() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [otpError, setOtpError] = useState("");

  const handleRequestOTP = async () => {
    setIsRequestingOTP(true);
    setOtpError("");

    try {
      await requestDeleteOTP();
      setShowDeleteModal(false);
      setShowOTPModal(true);
      toast.success("OTP sent to your phone number");
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsDeleting(true);
    setOtpError("");

    try {
      await deleteAccount(otp);
      toast.success("Account deleted successfully");
      setShowOTPModal(false);
      // Redirect to logout or home page
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/";
    } catch (error) {
      setOtpError("Invalid OTP or failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (otpError) setOtpError("");
  };

  return (
    <div className="space-y-6">
      {/* Account Deletion Policy */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-base text-gray-900">
            Account Deletion Policy
          </h4>
        </div>
        <div className="p-4">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>
                You&apos;ll no longer be able to access your saved professionals
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Your customer rating will be reset</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>All your memberships will be cancelled</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>
                You&apos;ll not be able to claim under any active warranty or
                insurance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>The changes are irreversible</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Delete Account Action */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-base text-gray-900">
                Delete Account
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone and will permanently remove all your data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestOTP}
                disabled={isRequestingOTP}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isRequestingOTP ? "Sending OTP..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Verify OTP
            </h3>
            <p className="text-gray-600 mb-4">
              Enter the 6-digit OTP sent to your phone number to confirm account
              deletion.
            </p>

            <div className="mb-4">
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                maxLength={6}
              />
              {otpError && (
                <p className="text-red-600 text-sm mt-1">{otpError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp("");
                  setOtpError("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || otp.length !== 6}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
