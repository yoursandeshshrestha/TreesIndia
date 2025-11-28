"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import { ServiceArea, CreateServiceAreaRequest } from "@/core/ServicesManagementPage/types";

interface ServiceAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceArea: ServiceArea | null;
  onSubmit: (data: CreateServiceAreaRequest) => Promise<void>;
  isLoading?: boolean;
}

export default function ServiceAreaModal({
  isOpen,
  onClose,
  serviceArea,
  onSubmit,
  isLoading = false,
}: ServiceAreaModalProps) {
  const [formData, setFormData] = useState<CreateServiceAreaRequest>({
    city: "",
    state: "",
    country: "India",
    pincodes: [],
    is_active: true,
  });
  const [pincodeInput, setPincodeInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (serviceArea) {
      setFormData({
        city: serviceArea.city,
        state: serviceArea.state,
        country: serviceArea.country,
        pincodes: serviceArea.pincodes || [],
        is_active: serviceArea.is_active,
      });
    } else {
      setFormData({
        city: "",
        state: "",
        country: "India",
        pincodes: [],
        is_active: true,
      });
    }
    setPincodeInput("");
    setErrors({});
  }, [serviceArea, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch {
      // Error is handled in parent component
    }
  };

  const handleInputChange = (
    field: keyof CreateServiceAreaRequest,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addPincode = () => {
    const pincode = pincodeInput.trim();
    if (pincode && /^\d{6}$/.test(pincode)) {
      const currentPincodes = formData.pincodes || [];
      if (!currentPincodes.includes(pincode)) {
        handleInputChange("pincodes", [...currentPincodes, pincode]);
        setPincodeInput("");
      }
    }
  };

  const removePincode = (pincode: string) => {
    handleInputChange(
      "pincodes",
      (formData.pincodes || []).filter((p) => p !== pincode)
    );
  };

  const handlePincodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPincode();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <h2 className="text-xl font-semibold text-gray-900">
            {serviceArea ? "Edit Service Area" : "Add Service Area"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Location Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city name"
                    error={errors.city}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <Input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter state name"
                    error={errors.state}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <Input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Enter country name"
                  error={errors.country}
                />
              </div>
            </div>

            {/* Pincodes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Pincodes (Optional)
              </h3>

              {formData.pincodes && formData.pincodes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.pincodes.map((pincode) => (
                    <span
                      key={pincode}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {pincode}
                      <button
                        type="button"
                        onClick={() => removePincode(pincode)}
                        className="hover:text-blue-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={pincodeInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPincodeInput(value);
                  }}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  onKeyPress={handlePincodeKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPincode}
                  disabled={!pincodeInput.trim() || !/^\d{6}$/.test(pincodeInput)}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Add multiple pincodes to expand service coverage in this area
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange("is_active", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>
          </form>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t rounded-b-lg border-gray-200 bg-white">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {serviceArea ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
