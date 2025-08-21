"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import Dropdown from "@/components/Dropdown/Dropdown";
import Checkbox from "@/components/Checkbox/Checkbox";
import { AdminConfig, AdminConfigCategory } from "../types";

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<AdminConfig>) => void;
  config: AdminConfig | null;
}

const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  config,
}) => {
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    type: "string" as "string" | "int" | "float" | "bool",
    category: "system" as AdminConfigCategory,
    description: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or config changes
  useEffect(() => {
    if (isOpen && config) {
      setFormData({
        key: config.key,
        value: config.value,
        type: config.type,
        category: config.category,
        description: config.description,
        is_active: config.is_active,
      });
      setErrors({});
    }
  }, [isOpen, config]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.value.trim()) {
      newErrors.value = "Value is required";
    }

    // Type-specific validation
    if (formData.type === "int") {
      if (!/^\d+$/.test(formData.value)) {
        newErrors.value = "Value must be a valid integer";
      }
    } else if (formData.type === "float") {
      if (!/^\d+(\.\d+)?$/.test(formData.value)) {
        newErrors.value = "Value must be a valid decimal number";
      }
    } else if (formData.type === "bool") {
      if (!["true", "false", "1", "0"].includes(formData.value.toLowerCase())) {
        newErrors.value = "Value must be true, false, 1, or 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize boolean values
      let normalizedValue = formData.value;
      if (formData.type === "bool") {
        normalizedValue = ["true", "1"].includes(formData.value.toLowerCase())
          ? "true"
          : "false";
      }

      const submitData = {
        ...formData,
        value: normalizedValue,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration Key
              </label>
              <Input
                type="text"
                value={formData.key}
                onChange={(e) => handleInputChange("key", e.target.value)}
                placeholder="e.g., max_wallet_balance"
                error={errors.key}
                disabled={true}
              />
              <p className="mt-1 text-xs text-gray-500">
                Configuration key cannot be modified
              </p>
            </div>

            {/* Value */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value *
              </label>
              {formData.type === "bool" ? (
                <Dropdown
                  trigger={
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left">
                      {formData.value === "true"
                        ? "True"
                        : formData.value === "false"
                        ? "False"
                        : "Select value"}
                    </div>
                  }
                  items={[
                    { value: "true", label: "True" },
                    { value: "false", label: "False" },
                  ]}
                  onSelect={(value) => handleInputChange("value", value)}
                />
              ) : formData.type === "string" &&
                (formData.key === "working_hours_start" ||
                  formData.key === "working_hours_end") ? (
                <Input
                  type="time"
                  value={formData.value}
                  onChange={(e) => handleInputChange("value", e.target.value)}
                  placeholder="Select time"
                  error={errors.value}
                />
              ) : formData.type === "string" &&
                formData.description.length > 100 ? (
                <Textarea
                  value={formData.value}
                  onChange={(e) => handleInputChange("value", e.target.value)}
                  placeholder="Enter value"
                  error={errors.value}
                  rows={3}
                />
              ) : (
                <Input
                  type={
                    formData.type === "int" || formData.type === "float"
                      ? "number"
                      : "text"
                  }
                  value={formData.value}
                  onChange={(e) => handleInputChange("value", e.target.value)}
                  placeholder={`Enter ${formData.type} value`}
                  error={errors.value}
                />
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                placeholder="Description of this configuration"
                rows={3}
                disabled={true}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Saving..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminConfigModal;
