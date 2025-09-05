"use client";

import React, { useState } from "react";
import { Bell, Mail, MessageSquare, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { NotificationSettings } from "@/lib/profileApi";

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

// Notification Item Component
interface NotificationItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  isUpdating?: boolean;
}

function NotificationItem({
  icon,
  title,
  description,
  enabled,
  onToggle,
  isUpdating = false,
}: NotificationItemProps) {
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
            <Loader2 className="w-4 h-4 animate-spin text-[#00a871]" />
          ) : (
            <ToggleSwitch enabled={enabled} onToggle={onToggle} />
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationSettingsSection() {
  const {
    notificationSettings,
    isLoadingNotificationSettings,
    isUpdatingNotificationSettings,
    updateNotificationSettingsAsync,
    refetchNotificationSettings,
  } = useProfile();

  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: true,
    marketing_emails: false,
    booking_reminders: true,
    service_updates: true,
  });

  // Initialize settings when data loads
  React.useEffect(() => {
    if (notificationSettings) {
      setSettings(notificationSettings);
    }
  }, [notificationSettings]);

  const handleToggle = async (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(newSettings);

    try {
      await updateNotificationSettingsAsync(newSettings);
      toast.success("Notification setting updated");
      refetchNotificationSettings();
    } catch {
      // Revert the change if update fails
      setSettings(settings);
      toast.error("Failed to update notification setting");
    }
  };

  if (isLoadingNotificationSettings) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const notificationItems = [
    {
      key: "email_notifications" as keyof NotificationSettings,
      icon: <Mail className="w-5 h-5" />,
      title: "Email Notifications",
      description:
        "Receive important updates and booking confirmations via email",
    },
    {
      key: "sms_notifications" as keyof NotificationSettings,
      icon: <MessageSquare className="w-5 h-5" />,
      title: "SMS Notifications",
      description: "Get instant updates and reminders via text message",
    },
    {
      key: "booking_reminders" as keyof NotificationSettings,
      icon: <Bell className="w-5 h-5" />,
      title: "Booking Reminders",
      description: "Get reminded about upcoming service appointments",
    },
    {
      key: "service_updates" as keyof NotificationSettings,
      icon: <Settings className="w-5 h-5" />,
      title: "Service Updates",
      description: "Stay informed about service changes and improvements",
    },
    {
      key: "marketing_emails" as keyof NotificationSettings,
      icon: <Mail className="w-5 h-5" />,
      title: "Marketing Emails",
      description: "Receive promotional offers and special deals",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Other Notification Settings */}
      <div className="divide-y divide-gray-200">
        {notificationItems.map((item) => (
          <NotificationItem
            key={item.key}
            icon={item.icon}
            title={item.title}
            description={item.description}
            enabled={settings[item.key]}
            onToggle={() => handleToggle(item.key)}
            isUpdating={isUpdatingNotificationSettings}
          />
        ))}
      </div>
    </div>
  );
}
