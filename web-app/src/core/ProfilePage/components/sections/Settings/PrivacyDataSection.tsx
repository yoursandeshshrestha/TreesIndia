"use client";

import React, { useState } from "react";
import {
  Eye,
  Database,
  Shield,
  Lock,
  Download as DownloadIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

// Toggle Switch Component
interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function ToggleSwitch({
  enabled,
  onToggle,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00a871] focus:ring-offset-2 ${
        enabled ? "bg-[#00a871]" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// Privacy Item Component
interface PrivacyItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  isUpdating?: boolean;
}

function PrivacyItem({
  icon,
  title,
  description,
  enabled,
  onToggle,
  isUpdating = false,
}: PrivacyItemProps) {
  return (
    <div className="py-3 px-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-gray-600">{icon}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-base text-gray-900">
                {title}
              </span>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p>{description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isUpdating ? (
            <div className="w-4 h-4 animate-spin text-[#00a871]">⏳</div>
          ) : (
            <ToggleSwitch enabled={enabled} onToggle={onToggle} />
          )}
        </div>
      </div>
    </div>
  );
}

export function PrivacyDataSection() {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    dataAnalytics: false,
    thirdPartySharing: false,
    locationSharing: true,
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePrivacyToggle = async (key: keyof typeof privacySettings) => {
    const newSettings = {
      ...privacySettings,
      [key]: !privacySettings[key],
    };

    setPrivacySettings(newSettings);

    try {
      // TODO: Implement API call to update privacy settings
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Privacy setting updated");
    } catch {
      // Revert the change if update fails
      setPrivacySettings(privacySettings);
      toast.error("Failed to update privacy setting");
    }
  };

  const handleDownloadData = async () => {
    setIsDownloading(true);
    try {
      // TODO: Implement data download logic
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate download
      toast.success(
        "Data download started. You'll receive an email when ready."
      );
    } catch {
      toast.error("Failed to download data");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteData = async () => {
    setIsDeleting(true);
    try {
      // TODO: Implement data deletion logic
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate deletion
      toast.success("Data deletion request submitted");
    } catch {
      toast.error("Failed to delete data");
    } finally {
      setIsDeleting(false);
    }
  };

  const privacyItems = [
    {
      key: "profileVisibility" as keyof typeof privacySettings,
      icon: <Eye className="w-5 h-5" />,
      title: "Profile Visibility",
      description: "Allow other users to see your profile information",
    },
    {
      key: "dataAnalytics" as keyof typeof privacySettings,
      icon: <Database className="w-5 h-5" />,
      title: "Data Analytics",
      description: "Help us improve by sharing anonymous usage data",
    },
    {
      key: "thirdPartySharing" as keyof typeof privacySettings,
      icon: <Shield className="w-5 h-5" />,
      title: "Third-party Sharing",
      description: "Allow sharing data with trusted third-party services",
    },
    {
      key: "locationSharing" as keyof typeof privacySettings,
      icon: <Lock className="w-5 h-5" />,
      title: "Location Sharing",
      description: "Share your location for better service recommendations",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Privacy & Data</h3>
        <p className="text-gray-600 mt-1">
          Control your privacy settings and manage your data
        </p>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-base text-gray-900">
            Privacy Settings
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Control how your information is shared and used
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {privacyItems.map((item) => (
            <PrivacyItem
              key={item.key}
              icon={item.icon}
              title={item.title}
              description={item.description}
              enabled={privacySettings[item.key]}
              onToggle={() => handlePrivacyToggle(item.key)}
            />
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-base text-gray-900">
            Data Management
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Download or delete your personal data
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="py-3 px-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-gray-600">
                  <DownloadIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-base text-gray-900">
                      Download My Data
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p>Get a copy of all your personal data</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownloadData}
                disabled={isDownloading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>

          <div className="py-3 px-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-gray-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-base text-gray-900">
                      Delete My Data
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p>Permanently delete all your personal data</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDeleteData}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Your Privacy Matters
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              We&apos;re committed to protecting your privacy. Your data is
              encrypted and we never share your personal information without
              your explicit consent. You have full control over your data and
              can modify these settings at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
