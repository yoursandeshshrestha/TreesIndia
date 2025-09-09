"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";

import {
  SubscriptionPlan,
  CreateSubscriptionRequest,
  CreateSubscriptionWithBothDurationsRequest,
  UpdateSubscriptionRequest,
} from "../types";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription?: SubscriptionPlan | null;
  onSubmit: (
    data: CreateSubscriptionRequest | UpdateSubscriptionRequest
  ) => Promise<void>;
  isLoading?: boolean;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSubmit,
}: SubscriptionModalProps) {
  const [formData, setFormData] =
    useState<CreateSubscriptionWithBothDurationsRequest>({
      name: "",
      monthly_price: 0,
      yearly_price: 0,
      description: "",
      features: [],
    });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!subscription;

  useEffect(() => {
    if (subscription) {
      // For editing, we'll need to get both monthly and yearly pricing
      // This would require fetching all subscriptions with the same name
      setFormData({
        name: subscription.name,
        monthly_price:
          subscription.duration_type === "monthly" ? subscription.price : 0,
        yearly_price:
          subscription.duration_type === "yearly" ? subscription.price : 0,
        description: subscription.description || "",
        features:
          subscription.features &&
          typeof subscription.features === "object" &&
          "description" in subscription.features &&
          typeof subscription.features.description === "string"
            ? subscription.features.description
                .split("\n")
                .filter((line) => line.trim() !== "")
            : [],
      });
    } else {
      setFormData({
        name: "",
        monthly_price: 0,
        yearly_price: 0,
        description: "",
        features: [],
      });
    }
    setErrors({});
  }, [subscription, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (formData.monthly_price <= 0) {
      newErrors.monthly_price = "Monthly price must be greater than 0";
    }

    if (formData.yearly_price <= 0) {
      newErrors.yearly_price = "Yearly price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting subscription:", error);
      toast.error("Failed to submit subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateSubscriptionWithBothDurationsRequest,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), ""],
    }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = (formData.features || []).filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleFeatureKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Subscription Plan" : "Create Subscription Plan"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("name", e.target.value)
                  }
                  placeholder="Enter plan name"
                  error={errors.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Price (₹) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthly_price.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(
                      "monthly_price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Enter monthly price in rupees"
                  error={errors.monthly_price}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yearly Price (₹) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.yearly_price.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange(
                      "yearly_price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Enter yearly price in rupees"
                  error={errors.yearly_price}
                />
                {formData.monthly_price > 0 && formData.yearly_price > 0 && (
                  <p className="mt-1 text-sm text-green-600">
                    Yearly savings:{" "}
                    {Math.round(
                      (1 -
                        formData.yearly_price / (formData.monthly_price * 12)) *
                        100
                    )}
                    %
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the benefits of this plan..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Features
                </label>
                <div className="space-y-2">
                  {(formData.features || []).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                      <Input
                        type="text"
                        value={feature}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFeatureChange(index, e.target.value)
                        }
                        onKeyPress={handleFeatureKeyPress}
                        placeholder={
                          index === 0
                            ? "Enter key features of this plan..."
                            : "Enter another feature..."
                        }
                      />
                      {(formData.features || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          disabled={isSubmitting}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {(formData.features || []).length === 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                      <Input
                        type="text"
                        value=""
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.value) {
                            handleFeatureChange(0, e.target.value);
                          }
                        }}
                        onKeyPress={handleFeatureKeyPress}
                        placeholder="Enter key features of this plan..."
                      />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Press Enter to add a new bullet point
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 rounded-b-lg border-t border-gray-200 bg-white sticky bottom-0 z-floating">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {isEditing ? "Update Plan" : "Create Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
