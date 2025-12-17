"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Send, Users, X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import { api } from "@/lib/api-client";
import {
  useSendFCMNotification,
  useSendFCMNotificationBulk,
} from "@/services/api/notifications";
import UserSelector from "./components/UserSelector";
import FCMNotificationHeader from "./components/FCMNotificationHeader";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

const NOTIFICATION_TYPES = [
  { value: "booking", label: "Booking" },
  { value: "worker_assignment", label: "Worker Assignment" },
  { value: "payment", label: "Payment" },
  { value: "subscription", label: "Subscription" },
  { value: "chat", label: "Chat" },
  { value: "promotional", label: "Promotional" },
  { value: "system", label: "System" },
];

function FCMNotificationPage() {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isUserSelectorOpen, setIsUserSelectorOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    type: "promotional",
    title: "",
    body: "",
    image_url: "",
    click_action: "",
    priority: "normal",
  });

  const sendNotificationMutation = useSendFCMNotification();
  const sendBulkNotificationMutation = useSendFCMNotificationBulk();

  // Load users when component mounts
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams({
        limit: "1000", // Get more users for selection
      });
      const response = await api.get(`/admin/users?${params}`);

      // Handle different response structures
      interface ApiUser {
        ID?: number;
        id?: number;
        name?: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        phone_number?: string;
      }

      let usersArray: ApiUser[] = [];

      // The API returns: { data: { users: [...], pagination: {...} } }
      if (response && response.data) {
        // Check if response.data has a users property (paginated response)
        if (response.data.users && Array.isArray(response.data.users)) {
          usersArray = response.data.users;
        }
        // Check if response.data is directly an array (fallback)
        else if (Array.isArray(response.data)) {
          usersArray = response.data;
        }
      }

      setUsers(
        usersArray.map((user: ApiUser) => ({
          id: user.ID || user.id || 0,
          name:
            user.name ||
            `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
            "Unknown",
          email: user.email || "",
          phone: user.phone || user.phone_number || "",
        }))
      );
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleUserSelect = (userIds: number[]) => {
    setSelectedUsers(userIds);
    setIsUserSelectorOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendSingle = async () => {
    if (selectedUsers.length !== 1) {
      toast.error("Please select exactly one user");
      return;
    }

    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    try {
      await sendNotificationMutation.mutateAsync({
        user_id: selectedUsers[0],
        type: formData.type,
        title: formData.title,
        body: formData.body,
        image_url: formData.image_url || undefined,
        click_action: formData.click_action || undefined,
        priority: formData.priority || undefined,
      });

      toast.success("Notification sent successfully!");
      // Reset form
      setFormData({
        type: "promotional",
        title: "",
        body: "",
        image_url: "",
        click_action: "",
        priority: "normal",
      });
      setSelectedUsers([]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "Failed to send notification";
      toast.error(errorMessage);
    }
  };

  const handleSendBulk = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    try {
      const response = await sendBulkNotificationMutation.mutateAsync({
        user_ids: selectedUsers,
        type: formData.type,
        title: formData.title,
        body: formData.body,
        image_url: formData.image_url || undefined,
        click_action: formData.click_action || undefined,
        priority: formData.priority || undefined,
      });

      const { success_count, failure_count } = response.data;
      toast.success(
        `Notifications sent: ${success_count} successful, ${failure_count} failed`
      );

      // Reset form
      setFormData({
        type: "promotional",
        title: "",
        body: "",
        image_url: "",
        click_action: "",
        priority: "normal",
      });
      setSelectedUsers([]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "Failed to send notifications";
      toast.error(errorMessage);
    }
  };

  const getSelectedUsersInfo = () => {
    return users.filter((user) => selectedUsers.includes(user.id));
  };

  const removeUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const isLoading =
    sendNotificationMutation.isPending ||
    sendBulkNotificationMutation.isPending;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <FCMNotificationHeader />

      {/* Main Form */}
      <div className="mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form className="space-y-6">
            {/* Recipients Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Recipients</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Users
                </label>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUserSelectorOpen(true)}
                    className="w-full"
                    leftIcon={<Users size={16} />}
                  >
                    {selectedUsers.length === 0
                      ? "Select Users"
                      : `${selectedUsers.length} user${
                          selectedUsers.length !== 1 ? "s" : ""
                        } selected`}
                  </Button>

                  {/* Selected Users List */}
                  {selectedUsers.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Selected Users:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getSelectedUsersInfo().map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5"
                          >
                            <span className="text-sm text-gray-900">
                              {user.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeUser(user.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notification Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Notification Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Type
                  </label>
                  <SearchableDropdown
                    options={NOTIFICATION_TYPES.map((type) => ({
                      label: type.label,
                      value: type.value,
                    }))}
                    value={formData.type}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: String(value) }))
                    }
                    placeholder="Select notification type"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <SearchableDropdown
                    options={[
                      { label: "Normal", value: "normal" },
                      { label: "High", value: "high" },
                      { label: "Low", value: "low" },
                    ]}
                    value={formData.priority}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, priority: String(value) }))
                    }
                    placeholder="Select priority"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter notification title"
                  required
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <Textarea
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  placeholder="Enter notification message"
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Advanced Options Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Advanced Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image URL (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                    <span className="text-gray-500 font-normal ml-1">
                      (Optional)
                    </span>
                  </label>
                  <Input
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </div>

                {/* Click Action (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Click Action
                    <span className="text-gray-500 font-normal ml-1">
                      (Optional)
                    </span>
                  </label>
                  <Input
                    name="click_action"
                    value={formData.click_action}
                    onChange={handleInputChange}
                    placeholder="e.g., OPEN_BOOKING, OPEN_CHAT"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleSendSingle}
                disabled={
                  isLoading ||
                  selectedUsers.length !== 1 ||
                  !formData.title.trim() ||
                  !formData.body.trim()
                }
                variant="outline"
                leftIcon={<Send size={16} />}
                loading={isLoading}
              >
                {isLoading ? "Sending..." : "Send to Selected User"}
              </Button>
              <Button
                type="button"
                onClick={handleSendBulk}
                disabled={
                  isLoading ||
                  selectedUsers.length === 0 ||
                  !formData.title.trim() ||
                  !formData.body.trim()
                }
                variant="primary"
                leftIcon={<Send size={16} />}
                loading={isLoading}
              >
                {isLoading
                  ? "Sending..."
                  : `Send to ${selectedUsers.length} User${
                      selectedUsers.length !== 1 ? "s" : ""
                    }`}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* User Selector Modal */}
      {isUserSelectorOpen && (
        <UserSelector
          onClose={() => setIsUserSelectorOpen(false)}
          onSelect={handleUserSelect}
        />
      )}
    </div>
  );
}

export default FCMNotificationPage;





