import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Clock,
  Globe,
  Shield,
  Save,
  RefreshCw,
  Download,
} from "lucide-react";
import { UserNotificationSettings, NotificationType } from "../types";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Select from "@/components/Select/Select";
import Checkbox from "@/components/Checkbox/Checkbox";

const NotificationSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<UserNotificationSettings>({
    user_id: 1,
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    notification_types: ["system", "booking", "payment"],
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load settings:", error);
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Settings saved:", settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotificationType = (type: NotificationType) => {
    setSettings((prev) => ({
      ...prev,
      notification_types: prev.notification_types.includes(type)
        ? prev.notification_types.filter((t) => t !== type)
        : [...prev.notification_types, type],
    }));
  };

  const notificationTypeOptions = [
    { value: "system", label: "System Notifications" },
    { value: "booking", label: "Booking Updates" },
    { value: "worker_assignment", label: "Worker Assignments" },
    { value: "payment", label: "Payment Confirmations" },
    { value: "subscription", label: "Subscription Updates" },
    { value: "chat", label: "Chat Messages" },
    { value: "promotional", label: "Promotional Offers" },
    { value: "test", label: "Test Notifications" },
  ];

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Notification Settings
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure notification preferences and delivery settings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadSettings}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={isSaving}>
            <Save size={16} className="mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Bell className="text-blue-600" size={20} />
            General Notification Settings
          </h3>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Checkbox
                id="push_notifications"
                checked={settings.push_notifications}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    push_notifications: e.target.checked,
                  }))
                }
              />
              <label
                htmlFor="push_notifications"
                className="text-sm font-medium text-gray-700"
              >
                Push Notifications
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="email_notifications"
                checked={settings.email_notifications}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    email_notifications: e.target.checked,
                  }))
                }
              />
              <label
                htmlFor="email_notifications"
                className="text-sm font-medium text-gray-700"
              >
                Email Notifications
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="sms_notifications"
                checked={settings.sms_notifications}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    sms_notifications: e.target.checked,
                  }))
                }
              />
              <label
                htmlFor="sms_notifications"
                className="text-sm font-medium text-gray-700"
              >
                SMS Notifications
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Shield className="text-green-600" size={20} />
            Notification Types
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose which types of notifications you want to receive
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notificationTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-3">
                <Checkbox
                  id={option.value}
                  checked={settings.notification_types.includes(
                    option.value as NotificationType
                  )}
                  onChange={() =>
                    toggleNotificationType(option.value as NotificationType)
                  }
                />
                <label
                  htmlFor={option.value}
                  className="text-sm font-medium text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Clock className="text-yellow-600" size={20} />
            Quiet Hours
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Set times when notifications should be silenced (except urgent ones)
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiet Hours Start
              </label>
              <Input
                type="time"
                value={settings.quiet_hours_start}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    quiet_hours_start: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiet Hours End
              </label>
              <Input
                type="time"
                value={settings.quiet_hours_end}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    quiet_hours_end: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <Clock className="text-yellow-600 mt-0.5" size={16} />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Quiet Hours Active</p>
                <p className="text-xs mt-1">
                  Notifications will be silenced from{" "}
                  {settings.quiet_hours_start} to {settings.quiet_hours_end}{" "}
                  daily. Urgent notifications (system alerts, security) will
                  still be delivered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FCM Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Globe className="text-purple-600" size={20} />
            FCM Configuration
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Firebase Cloud Messaging settings and device management
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FCM Project ID
              </label>
              <Input value="treesindia-3fa39" disabled className="bg-gray-50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Account Status
              </label>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">2,847</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">1,923</div>
              <div className="text-sm text-gray-600">Active Devices</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">94.2%</div>
              <div className="text-sm text-gray-600">Delivery Rate</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Refresh Device Count
            </Button>
            <Button variant="outline" size="sm">
              <Shield size={16} className="mr-2" />
              Validate Tokens
            </Button>
            <Button variant="outline" size="sm">
              <Globe size={16} className="mr-2" />
              Test Connection
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Settings className="text-gray-600" size={20} />
            Advanced Settings
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Advanced notification configuration and debugging options
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retry Attempts
              </label>
              <Select
                value="3"
                onChange={() => {}}
                options={[
                  { value: "1", label: "1 attempt" },
                  { value: "2", label: "2 attempts" },
                  { value: "3", label: "3 attempts" },
                  { value: "5", label: "5 attempts" },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout (seconds)
              </label>
              <Input
                type="number"
                value="30"
                min="5"
                max="120"
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox id="debug_mode" checked={false} onChange={() => {}} />
              <label
                htmlFor="debug_mode"
                className="text-sm font-medium text-gray-700"
              >
                Enable Debug Mode
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="log_delivery" checked={true} onChange={() => {}} />
              <label
                htmlFor="log_delivery"
                className="text-sm font-medium text-gray-700"
              >
                Log Delivery Attempts
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="auto_cleanup" checked={true} onChange={() => {}} />
              <label
                htmlFor="auto_cleanup"
                className="text-sm font-medium text-gray-700"
              >
                Auto-cleanup Invalid Tokens
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <RefreshCw size={16} className="mr-2" />
                Reset to Defaults
              </Button>
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export Configuration
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving} size="lg">
          <Save size={16} className="mr-2" />
          {isSaving ? "Saving Settings..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettingsTab;
