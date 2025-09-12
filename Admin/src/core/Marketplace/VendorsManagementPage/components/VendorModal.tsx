"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, MapPin, Building, User, Phone, Mail } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import {
  Vendor,
  CreateVendorRequest,
  UpdateVendorRequest,
  BusinessType,
  BusinessAddress,
} from "../types";
import Image from "next/image";

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: Vendor | null;
  onSubmit: (
    data: CreateVendorRequest | UpdateVendorRequest,
    imageFiles?: File[]
  ) => Promise<void>;
  isLoading?: boolean;
}

export function VendorModal({
  isOpen,
  onClose,
  vendor,
  onSubmit,
  isLoading = false,
}: VendorModalProps) {
  const [formData, setFormData] = useState<CreateVendorRequest>({
    vendor_name: "",
    business_description: "",
    contact_person_name: "",
    contact_person_phone: "",
    contact_person_email: "",
    business_address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    business_type: "individual",
    years_in_business: 0,
    services_offered: [],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newService, setNewService] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_name: vendor.vendor_name,
        business_description: vendor.business_description || "",
        contact_person_name: vendor.contact_person_name,
        contact_person_phone: vendor.contact_person_phone,
        contact_person_email: vendor.contact_person_email || "",
        business_address: vendor.business_address || {
          street: "",
          city: "",
          state: "",
          pincode: "",
          landmark: "",
        },
        business_type: vendor.business_type,
        years_in_business: vendor.years_in_business,
        services_offered: vendor.services_offered || [],
      });
      setImagePreviews(vendor.business_gallery || []);
      setSelectedFiles([]);
    } else {
      // Reset form for new vendor
      setFormData({
        vendor_name: "",
        business_description: "",
        contact_person_name: "",
        contact_person_phone: "",
        contact_person_email: "",
        business_address: {
          street: "",
          city: "",
          state: "",
          pincode: "",
          landmark: "",
        },
        business_type: "individual",
        years_in_business: 0,
        services_offered: [],
      });
      setImagePreviews([]);
      setSelectedFiles([]);
    }
    setErrors({});
  }, [vendor, isOpen]);

  const businessTypeOptions = [
    { value: "individual", label: "Individual" },
    { value: "partnership", label: "Partnership" },
    { value: "company", label: "Company" },
    { value: "llp", label: "LLP" },
    { value: "pvt_ltd", label: "Private Limited" },
    { value: "public_ltd", label: "Public Limited" },
    { value: "other", label: "Other" },
  ];

  const handleInputChange = (
    field: string,
    value: string | number | BusinessAddress
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

  const handleAddressChange = (field: keyof BusinessAddress, value: string) => {
    setFormData((prev) => ({
      ...prev,
      business_address: {
        ...prev.business_address,
        [field]: value,
      },
    }));
  };

  const handleAddService = () => {
    if (newService.trim() && !formData.services_offered.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        services_offered: [...prev.services_offered, newService.trim()],
      }));
      setNewService("");
    }
  };

  const handleRemoveService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services_offered: prev.services_offered.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    // Create previews for new files
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendor_name.trim()) {
      newErrors.vendor_name = "Vendor name is required";
    }

    if (!formData.contact_person_name.trim()) {
      newErrors.contact_person_name = "Contact person name is required";
    }

    if (!formData.contact_person_phone.trim()) {
      newErrors.contact_person_phone = "Contact person phone is required";
    }

    if (formData.contact_person_email && !/\S+@\S+\.\S+/.test(formData.contact_person_email)) {
      newErrors.contact_person_email = "Please enter a valid email address";
    }

    if (!formData.business_address.city?.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.business_address.state?.trim()) {
      newErrors.state = "State is required";
    }

    if (formData.years_in_business < 0) {
      newErrors.years_in_business = "Years in business cannot be negative";
    }

    if (formData.services_offered.length === 0) {
      newErrors.services_offered = "At least one service is required";
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
      await onSubmit(formData, selectedFiles.length > 0 ? selectedFiles : undefined);
      onClose();
    } catch (error) {
      console.error("Error submitting vendor:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {vendor ? "Edit Vendor" : "Create New Vendor"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Building size={20} />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name *
                </label>
                <Input
                  value={formData.vendor_name}
                  onChange={(e) => handleInputChange("vendor_name", e.target.value)}
                  placeholder="Enter vendor name"
                  error={errors.vendor_name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type *
                </label>
                <SearchableDropdown
                  options={businessTypeOptions}
                  value={formData.business_type}
                  onChange={(value) => handleInputChange("business_type", value as BusinessType)}
                  placeholder="Select business type"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <Textarea
                value={formData.business_description}
                onChange={(e) => handleInputChange("business_description", e.target.value)}
                placeholder="Enter business description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years in Business
                </label>
                <Input
                  type="number"
                  value={formData.years_in_business}
                  onChange={(e) => handleInputChange("years_in_business", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  error={errors.years_in_business}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User size={20} />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person Name *
                </label>
                <Input
                  value={formData.contact_person_name}
                  onChange={(e) => handleInputChange("contact_person_name", e.target.value)}
                  placeholder="Enter contact person name"
                  error={errors.contact_person_name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person Phone *
                </label>
                <Input
                  value={formData.contact_person_phone}
                  onChange={(e) => handleInputChange("contact_person_phone", e.target.value)}
                  placeholder="Enter phone number"
                  error={errors.contact_person_phone}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person Email
              </label>
              <Input
                type="email"
                value={formData.contact_person_email}
                onChange={(e) => handleInputChange("contact_person_email", e.target.value)}
                placeholder="Enter email address"
                error={errors.contact_person_email}
              />
            </div>
          </div>

          {/* Business Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <MapPin size={20} />
              Business Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <Input
                  value={formData.business_address.street || ""}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                  placeholder="Enter street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <Input
                  value={formData.business_address.city || ""}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                  placeholder="Enter city"
                  error={errors.city}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <Input
                  value={formData.business_address.state || ""}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                  placeholder="Enter state"
                  error={errors.state}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <Input
                  value={formData.business_address.pincode || ""}
                  onChange={(e) => handleAddressChange("pincode", e.target.value)}
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landmark
              </label>
              <Input
                value={formData.business_address.landmark || ""}
                onChange={(e) => handleAddressChange("landmark", e.target.value)}
                placeholder="Enter landmark"
              />
            </div>
          </div>

          {/* Services Offered */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Services Offered</h3>

            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Enter service name"
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddService();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddService}
                disabled={!newService.trim()}
              >
                Add
              </Button>
            </div>

            {formData.services_offered.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.services_offered.map((service, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.services_offered && (
              <p className="text-red-500 text-sm">{errors.services_offered}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Business Gallery</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Click to upload images or drag and drop
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Files
              </Button>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
            >
              {vendor ? "Update Vendor" : "Create Vendor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
