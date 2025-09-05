"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Send, Users, Target, Bell, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";

// Components
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import Select from "@/components/Select/Select";
import Checkbox from "@/components/Checkbox/Checkbox";
import NotificationPreview from "./NotificationPreview";
import NotificationTemplates from "./NotificationTemplates";
import UserSelector from "./UserSelector";

// Types
import {
  NotificationTarget,
  SendNotificationRequest,
  NotificationTemplate,
} from "../types";

const SendNotificationTab: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<SendNotificationRequest>({
    target: "all_users",
    notification: {
      title: "",
      body: "",
      type: "system",
    },
    priority: "normal",
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // TODO: Replace with actual API call
      const mockTemplates: NotificationTemplate[] = [
        {
          id: "1",
          name: "Welcome Message",
          type: "system",
          title: "Welcome to TREESINDIA! 🌳",
          body: "Thank you for joining our platform. We're excited to help you with your home services!",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Booking Confirmation",
          type: "booking",
          title: "✅ Booking Confirmed!",
          body: "Your {service_name} has been confirmed for {scheduled_date} at {scheduled_time}.",
          data_template: {
            service_name: "Cleaning Service",
            scheduled_date: "Tomorrow",
            scheduled_time: "2:00 PM",
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Special Offer",
          type: "promotional",
          title: "🎉 Special Offer - {discount} Off!",
          body: "Get {discount} off on your next {service_type} booking. Limited time only!",
          data_template: {
            discount: "20%",
            service_type: "cleaning service",
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("notification.")) {
      const notificationField = field.replace("notification.", "");
      setFormData((prev) => ({
        ...prev,
        notification: {
          ...prev.notification,
          [notificationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setFormData((prev) => ({
      ...prev,
      notification: {
        title: template.title,
        body: template.body,
        type: template.type,
        data: template.data_template,
      },
    }));
    setShowTemplates(false);
    toast.success(`Template "${template.name}" loaded`);
  };

  const handleSendNotification = async () => {
    if (!formData.notification.title || !formData.notification.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await api.post(
        "/admin/notifications/send",
        formData as unknown as Record<string, unknown>
      );

      if (response.success) {
        toast.success("Notification sent successfully!");
        // Reset form
        setFormData({
          target: "all_users",
          notification: {
            title: "",
            body: "",
            type: "system",
          },
          priority: "normal",
        });
      } else {
        toast.error(response.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!formData.notification.title || !formData.notification.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Send test notification to admin's own device
      const testData = {
        ...formData,
        target: "device_tokens" as NotificationTarget,
        target_value: "admin_test_token", // TODO: Get actual admin device token
      };

      const response = await api.post("/admin/notifications/send", testData);

      if (response.success) {
        toast.success("Test notification sent! Check your device.");
      } else {
        toast.error(response.message || "Failed to send test notification");
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification");
    } finally {
      setIsLoading(false);
    }
  };

  const getTargetDescription = () => {
    switch (formData.target) {
      case "all_users":
        return "Send to all registered users";
      case "specific_users":
        return "Send to selected users";
      case "user_group":
        return "Send to users in specific group";
      case "topic":
        return "Send to users subscribed to topic";
      case "device_tokens":
        return "Send to specific devices";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Bell className="text-blue-600" size={20} />
        <div className="flex-1">
          <h3 className="font-medium text-blue-900">Quick Actions</h3>
          <p className="text-sm text-blue-700">
            Use templates or send custom notifications
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplates(true)}
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <Plus size={16} className="mr-2" />
          Use Template
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(true)}
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <Bell size={16} className="mr-2" />
          Preview
        </Button>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Notification Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Notification Content
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Type
                </label>
                <Select
                  value={formData.notification.type}
                  onChange={(value) =>
                    handleInputChange("notification.type", value)
                  }
                  options={[
                    { value: "system", label: "System" },
                    { value: "booking", label: "Booking" },
                    { value: "worker_assignment", label: "Worker Assignment" },
                    { value: "payment", label: "Payment" },
                    { value: "subscription", label: "Subscription" },
                    { value: "chat", label: "Chat" },
                    { value: "promotional", label: "Promotional" },
                    { value: "test", label: "Test" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={formData.notification.title}
                  onChange={(e) =>
                    handleInputChange("notification.title", e.target.value)
                  }
                  placeholder="Enter notification title"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.notification.title.length}/100 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <Textarea
                  value={formData.notification.body}
                  onChange={(e) =>
                    handleInputChange("notification.body", e.target.value)
                  }
                  placeholder="Enter notification message"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.notification.body.length}/500 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Click Action
                </label>
                <Input
                  value={formData.notification.click_action || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "notification.click_action",
                      e.target.value
                    )
                  }
                  placeholder="e.g., OPEN_APP, VIEW_BOOKING"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (Optional)
                </label>
                <Input
                  value={formData.notification.image_url || ""}
                  onChange={(e) =>
                    handleInputChange("notification.image_url", e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Custom Data */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Custom Data (Optional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add custom key-value pairs that will be sent with the notification
            </p>

            <div className="space-y-3">
              {Object.entries(formData.notification.data || {}).map(
                ([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={key}
                      onChange={(e) => {
                        const newData = { ...formData.notification.data };
                        delete newData[key];
                        newData[e.target.value] = value;
                        setFormData((prev) => ({
                          ...prev,
                          notification: {
                            ...prev.notification,
                            data: newData,
                          },
                        }));
                      }}
                      placeholder="Key"
                      className="flex-1"
                    />
                    <Input
                      value={value}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          notification: {
                            ...prev.notification,
                            data: {
                              ...prev.notification.data,
                              [key]: e.target.value,
                            },
                          },
                        }));
                      }}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newData = { ...formData.notification.data };
                        delete newData[key];
                        setFormData((prev) => ({
                          ...prev,
                          notification: {
                            ...prev.notification,
                            data: newData,
                          },
                        }));
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newData = { ...formData.notification.data };
                  newData[`key_${Object.keys(newData).length + 1}`] = "";
                  setFormData((prev) => ({
                    ...prev,
                    notification: {
                      ...prev.notification,
                      data: newData,
                    },
                  }));
                }}
                className="w-full"
              >
                <Plus size={16} className="mr-2" />
                Add Custom Data
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Target & Settings */}
        <div className="space-y-6">
          {/* Target Selection */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Target Audience
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Type
                </label>
                <Select
                  value={formData.target}
                  onChange={(value) => handleInputChange("target", value)}
                  options={[
                    { value: "all_users", label: "All Users" },
                    { value: "specific_users", label: "Specific Users" },
                    { value: "user_group", label: "User Group" },
                    { value: "topic", label: "Topic" },
                    { value: "device_tokens", label: "Device Tokens" },
                  ]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {getTargetDescription()}
                </p>
              </div>

              {formData.target === "specific_users" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Users
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserSelector(true)}
                    className="w-full"
                  >
                    <Users size={16} className="mr-2" />
                    Choose Users
                  </Button>
                </div>
              )}

              {formData.target === "topic" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic Name
                  </label>
                  <Input
                    value={(formData.target_value as string) || ""}
                    onChange={(e) =>
                      handleInputChange("target_value", e.target.value)
                    }
                    placeholder="e.g., premium_users, new_customers"
                  />
                </div>
              )}

              {formData.target === "device_tokens" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Tokens
                  </label>
                  <Textarea
                    value={(formData.target_value as string) || ""}
                    onChange={(e) =>
                      handleInputChange("target_value", e.target.value)
                    }
                    placeholder="Enter device tokens (one per line)"
                    rows={4}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <Select
                  value={formData.priority || "normal"}
                  onChange={(value) => handleInputChange("priority", value)}
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "high", label: "High" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule (Optional)
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_at || ""}
                  onChange={(e) =>
                    handleInputChange("scheduled_at", e.target.value)
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="save_template"
                  checked={false}
                  onChange={() => {}}
                />
                <label
                  htmlFor="save_template"
                  className="text-sm text-gray-700"
                >
                  Save as template
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="space-y-3">
              <Button
                onClick={handleSendNotification}
                disabled={
                  isLoading ||
                  !formData.notification.title ||
                  !formData.notification.body
                }
                className="w-full"
                size="lg"
              >
                <Send size={16} className="mr-2" />
                {isLoading ? "Sending..." : "Send Notification"}
              </Button>

              <Button
                variant="outline"
                onClick={handleTestNotification}
                disabled={
                  isLoading ||
                  !formData.notification.title ||
                  !formData.notification.body
                }
                className="w-full"
                size="lg"
              >
                <Bell size={16} className="mr-2" />
                Send Test
              </Button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <Target size={16} className="text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Estimated Reach</p>
                  <p className="text-xs mt-1">
                    {formData.target === "all_users"
                      ? "~2,847 users"
                      : formData.target === "specific_users"
                      ? "Selected users"
                      : formData.target === "topic"
                      ? "Topic subscribers"
                      : "Custom devices"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTemplates && (
        <NotificationTemplates
          templates={templates}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showPreview && (
        <NotificationPreview
          notification={formData.notification}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showUserSelector && (
        <UserSelector
          onClose={() => setShowUserSelector(false)}
          onSelect={(userIds) => {
            setFormData((prev) => ({
              ...prev,
              target_value: userIds.join(","),
            }));
            setShowUserSelector(false);
          }}
        />
      )}
    </div>
  );
};

export default SendNotificationTab;
