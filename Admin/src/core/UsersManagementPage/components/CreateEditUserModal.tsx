import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Dropdown from "@/components/Dropdown/Dropdown";
import Checkbox from "@/components/Checkbox/Checkbox";
import { User } from "@/types/user";
import {
  USER_TYPE_OPTIONS,
  GENDER_OPTIONS,
  ROLE_APPLICATION_OPTIONS,
  validateUserForm,
  getDefaultUserData,
} from "@/utils/userUtils";

interface CreateEditUserModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Partial<User>) => void;
  initialData?: User | null;
  mode: "create" | "edit";
}

const CreateEditUserModal: React.FC<CreateEditUserModalProps> = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<Partial<User>>(getDefaultUserData());

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        name: initialData.name,
        email: initialData.email || "",
        phone: initialData.phone,
        user_type: initialData.user_type,
        gender: initialData.gender,
        is_active: initialData.is_active,
        role_application_status: initialData.role_application_status,
        wallet_balance: initialData.wallet_balance,
        wallet_limit: initialData.wallet_limit,
        has_active_subscription: initialData.has_active_subscription,
        subscription_expiry_date: initialData.subscription_expiry_date,
      });
    } else {
      setFormData(getDefaultUserData());
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  const validateForm = () => {
    const newErrors = validateUserForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof User, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  error={errors.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1234567890"
                  error={errors.phone}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="user@example.com"
                  error={errors.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <Dropdown
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {GENDER_OPTIONS.find(
                        (opt) => opt.value === formData.gender
                      )?.label || "Select gender"}
                    </Button>
                  }
                  items={GENDER_OPTIONS.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  onSelect={(value) => handleInputChange("gender", value)}
                />
              </div>
            </div>
          </div>

          {/* User Type and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              User Type & Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type *
                </label>
                <Dropdown
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {USER_TYPE_OPTIONS.find(
                        (opt) => opt.value === formData.user_type
                      )?.label || "Select user type"}
                    </Button>
                  }
                  items={USER_TYPE_OPTIONS.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  onSelect={(value) => handleInputChange("user_type", value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Application Status
                </label>
                <Dropdown
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {ROLE_APPLICATION_OPTIONS.find(
                        (opt) => opt.value === formData.role_application_status
                      )?.label || "Select status"}
                    </Button>
                  }
                  items={ROLE_APPLICATION_OPTIONS.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  onSelect={(value) =>
                    handleInputChange("role_application_status", value)
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.is_active || false}
                onChange={(checked) => handleInputChange("is_active", checked)}
              />
              <label className="text-sm font-medium text-gray-700">
                User is active
              </label>
            </div>
          </div>

          {/* Wallet Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Wallet Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Balance (₹)
                </label>
                <Input
                  type="number"
                  value={formData.wallet_balance || 0}
                  onChange={(e) =>
                    handleInputChange(
                      "wallet_balance",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                  error={errors.wallet_balance}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Limit (₹)
                </label>
                <Input
                  type="number"
                  value={formData.wallet_limit || 100000}
                  onChange={(e) =>
                    handleInputChange(
                      "wallet_limit",
                      parseFloat(e.target.value) || 100000
                    )
                  }
                  placeholder="100000"
                  error={errors.wallet_limit}
                />
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Subscription Information
            </h3>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.has_active_subscription || false}
                onChange={(checked) =>
                  handleInputChange("has_active_subscription", checked)
                }
              />
              <label className="text-sm font-medium text-gray-700">
                User has active subscription
              </label>
            </div>

            {formData.has_active_subscription && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Expiry Date
                </label>
                <Input
                  type="date"
                  value={formData.subscription_expiry_date || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "subscription_expiry_date",
                      e.target.value
                    )
                  }
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {mode === "create" ? "Create User" : "Update User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditUserModal;
