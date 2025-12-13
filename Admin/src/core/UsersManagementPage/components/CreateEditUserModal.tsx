import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import { type User } from "@/types/user";
import {
  GENDER_OPTIONS,
  validateUserForm,
  getDefaultUserData,
} from "@/utils/userUtils";
import { type AdminRole } from "@/services/api/auth";

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
  const [formData, setFormData] = useState<
    Partial<User> & {
      admin_role?: AdminRole;
    }
  >(getDefaultUserData());

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        name: initialData.name,
        email: initialData.email || "",
        phone: initialData.phone,
        gender: initialData.gender,
        // Include required backend fields with current values
        user_type: initialData.user_type,
        is_active: initialData.is_active,
        wallet_balance: initialData.wallet_balance,
        has_active_subscription: initialData.has_active_subscription,
      });
    } else {
      // For create mode in admin panel, we always create admin users with roles
      setFormData({
        ...getDefaultUserData(),
        user_type: "admin",
        is_active: true,
      });
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

    if (!validateForm()) {
      return;
    }

    // Always treat users created here as admin users with optional admin_role
    const payload: Partial<User> & { admin_roles?: AdminRole[] } = {
      ...formData,
      user_type: "admin",
      admin_roles: formData.admin_role ? [formData.admin_role] : undefined,
    };

    onSubmit(payload);
  };

  const handleInputChange = (
    field: keyof (User & { admin_role?: AdminRole }),
    value: unknown
  ) => {
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

  // Handle phone number change - ensure +91 prefix is always present
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Remove all non-digit characters
    const digitsOnly = inputValue.replace(/\D/g, "");
    // Limit to 10 digits (Indian phone number length)
    const limitedDigits = digitsOnly.slice(0, 10);
    // Always prepend +91 (the prefix is non-removable)
    const fullPhone = `+91${limitedDigits}`;
    handleInputChange("phone", fullPhone);
  };

  // Get the phone number part without +91 prefix for display
  const getPhoneNumberPart = (phone: string | undefined): string => {
    if (!phone) return "";
    // Remove +91 prefix if present
    if (phone.startsWith("+91")) {
      return phone.slice(3);
    }
    // If phone doesn't start with +91, extract just the digits (for edit mode)
    // This handles cases where existing phone might be in different format
    const digitsOnly = phone.replace(/\D/g, "");
    // If it's 10 digits, return as is; otherwise return last 10 digits
    return digitsOnly.length <= 10 ? digitsOnly : digitsOnly.slice(-10);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99] p-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full flex flex-col max-h-[95vh] overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0 overflow-visible">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value="+91"
                      disabled
                      fullWidth={false}
                      className="w-10 flex-shrink-0"
                    />
                    <Input
                      type="tel"
                      value={getPhoneNumberPart(formData.phone)}
                      onChange={handlePhoneChange}
                      placeholder="9876543210"
                      error={errors.phone}
                      className="flex-1"
                    />
                  </div>
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
                  <SearchableDropdown
                    options={GENDER_OPTIONS.map((option) => ({
                      label: option.label,
                      value: option.value,
                    }))}
                    value={formData.gender || ""}
                    onChange={(value) => handleInputChange("gender", value)}
                    placeholder="Select gender"
                  />
                </div>

                {/* Admin Role (we always treat users created here as admin users) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Role
                  </label>
                  <SearchableDropdown
                    options={[
                      { label: "Super Admin", value: "super_admin" },
                      { label: "Booking Manager", value: "booking_manager" },
                      { label: "Vendor Manager", value: "vendor_manager" },
                      { label: "Finance Manager", value: "finance_manager" },
                      { label: "Support Agent", value: "support_agent" },
                      { label: "Content Manager", value: "content_manager" },
                      {
                        label: "Properties Manager",
                        value: "properties_manager",
                      },
                    ]}
                    value={formData.admin_role || ""}
                    onChange={(value) =>
                      handleInputChange("admin_role", value as AdminRole)
                    }
                    placeholder="Select admin role"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Select the primary role for this admin to control what they
                    can manage in the panel.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Form Actions - Fixed at bottom */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t rounded-b-lg border-gray-200 bg-white">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {mode === "create" ? "Create User" : "Update User"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditUserModal;
