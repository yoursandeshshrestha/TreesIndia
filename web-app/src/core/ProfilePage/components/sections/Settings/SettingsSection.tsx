"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { requestDeleteOTP, deleteAccount } from "@/lib/profileApi";

export function SettingsSection() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [otpError, setOtpError] = useState("");

  const policyItems = [
    "You'll no longer be able to access your saved professionals",
    "Your customer rating will be reset",
    "All your memberships will be cancelled",
    "You'll not be able to claim under any active warranty or insurance",
    "The changes are irreversible",
  ];

  const handleRequestOTP = async () => {
    setIsRequestingOTP(true);
    setOtpError("");

    try {
      await requestDeleteOTP();
      setShowDeleteModal(false);
      setShowOTPModal(true);
      toast.success("OTP sent to your phone number");
    } catch {
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
    } catch {
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

  const handleOpenTerms = () => {
    window.open("https://treesindiaservices.com/terms-and-conditions", "_blank");
  };

  const handleOpenPrivacy = () => {
    window.open("https://treesindiaservices.com/privacy-policy", "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-[#111928]">Settings</h2>
        <p className="text-base text-[#6B7280] mt-1">
          Manage your account preferences and privacy
        </p>
      </div>

      {/* Account Deletion Policy */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-4 py-4 border-b border-[#E5E7EB]">
          <h4 className="text-base font-semibold text-[#111928]">
            Account Deletion Policy
          </h4>
        </div>
        <div className="px-4 py-4">
          {policyItems.map((item, index) => (
            <div key={index} className="flex items-start mb-2">
              <div className="w-1 h-1 rounded-full bg-[#9CA3AF] mt-2 mr-3" />
              <p className="flex-1 text-sm text-[#374151] leading-5">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
        <div className="mb-4">
          <h4 className="text-base font-semibold text-[#111928] mb-1">
            Delete Account
          </h4>
          <p className="text-sm text-[#6B7280]">
            Permanently delete your account and all associated data
          </p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-[#DC2626] rounded-lg py-2.5 px-4 text-sm font-semibold text-white hover:bg-[#B91C1C] transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Legal Information */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl">
        <div className="px-4 py-4 border-b border-[#E5E7EB]">
          <h4 className="text-base font-semibold text-[#111928]">
            Legal Information
          </h4>
        </div>
        <div className="px-4 py-4 space-y-3">
          <button
            onClick={handleOpenTerms}
            className="w-full bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <p className="text-sm font-semibold text-[#111928]">
              Terms and Conditions
            </p>
          </button>
          <button
            onClick={handleOpenPrivacy}
            className="w-full bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <p className="text-sm font-semibold text-[#111928]">
              Privacy Policy
            </p>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[#111928] mb-4">
              Delete Account
            </h3>
            <p className="text-[#6B7280] mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone and will permanently remove all your data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-[#E5E7EB] text-[#374151] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestOTP}
                disabled={isRequestingOTP}
                className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors disabled:opacity-50"
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[#111928] mb-4">
              Verify OTP
            </h3>
            <p className="text-[#6B7280] mb-4">
              Enter the 6-digit OTP sent to your phone number to confirm account
              deletion.
            </p>

            <div className="mb-4">
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                maxLength={6}
              />
              {otpError && (
                <p className="text-[#DC2626] text-sm mt-1">{otpError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp("");
                  setOtpError("");
                }}
                className="flex-1 px-4 py-2 border border-[#E5E7EB] text-[#374151] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || otp.length !== 6}
                className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors disabled:opacity-50"
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
