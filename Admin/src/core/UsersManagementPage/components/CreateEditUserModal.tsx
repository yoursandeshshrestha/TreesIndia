import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import { User } from "@/types/user";
import {
  GENDER_OPTIONS,
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
        gender: initialData.gender,
        // Include required backend fields with current values
        user_type: initialData.user_type,
        is_active: initialData.is_active,
        wallet_balance: initialData.wallet_balance,
        has_active_subscription: initialData.has_active_subscription,
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
