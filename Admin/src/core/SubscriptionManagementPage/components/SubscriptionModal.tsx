"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";

import {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from "../types";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription?: SubscriptionPlan | null;
  onSubmit: (data: CreateSubscriptionPlanRequest | UpdateSubscriptionPlanRequest) => Promise<void>;
  isLoading?: boolean;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSubmit,
}: SubscriptionModalProps) {
  const [formData, setFormData] = useState<CreateSubscriptionPlanRequest>({
    name: "",
    description: "",
    is_active: true,
    features: [],
    pricing: [
      { duration_type: "monthly", duration_days: 30, price: 0 },
      { duration_type: "yearly", duration_days: 365, price: 0 },
    ],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!subscription;

  useEffect(() => {
    if (subscription) {
      // Extract pricing from the subscription plan
      const monthlyPricing = subscription.pricing.find(
        (p) => p.duration_type === "monthly"
      );
      const yearlyPricing = subscription.pricing.find(
        (p) => p.duration_type === "yearly"
      );

      setFormData({
        name: subscription.name,
        description: subscription.description || "",
        is_active: subscription.is_active,
        features:
          subscription.features &&
          typeof subscription.features === "object" &&
          "description" in subscription.features &&
          typeof subscription.features.description === "string"
            ? subscription.features.description
                .split("\n")
                .filter((line) => line.trim() !== "")
            : [],
        pricing: [
          {
            duration_type: "monthly",
            duration_days: 30,
            price: monthlyPricing?.price || 0,
          },
          {
            duration_type: "yearly",
            duration_days: 365,
            price: yearlyPricing?.price || 0,
          },
        ],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        is_active: true,
        features: [],
        pricing: [
          { duration_type: "monthly", duration_days: 30, price: 0 },
          { duration_type: "yearly", duration_days: 365, price: 0 },
        ],
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

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Validate pricing
    const monthlyPrice =
      formData.pricing.find((p) => p.duration_type === "monthly")?.price || 0;
    const yearlyPrice =
      formData.pricing.find((p) => p.duration_type === "yearly")?.price || 0;

    if (monthlyPrice <= 0) {
      newErrors.monthly_price = "Monthly price must be greater than 0";
    }

    if (yearlyPrice <= 0) {
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
      if (isEditing) {
        // For editing, we need to pass UpdateSubscriptionPlanRequest
        const updateData: UpdateSubscriptionPlanRequest = {
          name: formData.name,
          description: formData.description,
          is_active: formData.is_active,
          features: formData.features,
          pricing: formData.pricing,
        };
        await onSubmit(updateData);
      } else {
        // For creating, we pass CreateSubscriptionPlanRequest
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error submitting subscription:", error);
      toast.error("Failed to submit subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateSubscriptionPlanRequest,
    value: string | number | string[] | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePricingChange = (
    durationType: "monthly" | "yearly",
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((p) =>
        p.duration_type === durationType ? { ...p, price: value } : p
      ),
    }));

    // Clear related error
    const errorKey = `${durationType}_price` as keyof typeof errors;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
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
                  value={
                    formData.pricing
                      .find((p) => p.duration_type === "monthly")
                      ?.price.toString() || "0"
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handlePricingChange(
                      "monthly",
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
                  value={
                    formData.pricing
                      .find((p) => p.duration_type === "yearly")
                      ?.price.toString() || "0"
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handlePricingChange(
                      "yearly",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Enter yearly price in rupees"
                  error={errors.yearly_price}
                />
                {(() => {
                  const monthlyPrice =
                    formData.pricing.find((p) => p.duration_type === "monthly")
                      ?.price || 0;
                  const yearlyPrice =
                    formData.pricing.find((p) => p.duration_type === "yearly")
                      ?.price || 0;
                  return (
                    monthlyPrice > 0 &&
                    yearlyPrice > 0 && (
                      <p className="mt-1 text-sm text-green-600">
                        Yearly savings:{" "}
                        {Math.round(
                          (1 - yearlyPrice / (monthlyPrice * 12)) * 100
                        )}
                        %
                      </p>
                    )
                  );
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the benefits of this plan..."
                  rows={3}
                  error={errors.description}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("is_active", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium text-gray-700"
                >
                  Active Plan
                </label>
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
