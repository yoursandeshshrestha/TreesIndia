"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Checkbox from "@/components/Checkbox/Checkbox";
import DurationPicker from "@/components/DurationPicker";
import {
  Service,
  Category,
  Subcategory,
  CreateServiceRequest,
  UpdateServiceRequest,
} from "../types";
import Image from "next/image";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  categories: Category[];
  subcategories: Subcategory[];
  onSubmit: (
    data: CreateServiceRequest | UpdateServiceRequest,
    imageFiles?: File[]
  ) => Promise<void>;
  isLoading?: boolean;
  onCategoryChange?: (categoryId: number) => void;
}

export function ServiceModal({
  isOpen,
  onClose,
  service,
  categories,
  subcategories,
  onSubmit,
  isLoading = false,
  onCategoryChange,
}: ServiceModalProps) {
  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: "",
    description: "",
    price_type: "inquiry",
    price: undefined,
    duration: "",
    category_id: 0,
    subcategory_id: 0,
    is_active: true,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
        price_type: service.price_type,
        price: service.price,
        duration: service.duration || "",
        category_id: service.category_id,
        subcategory_id: service.subcategory_id,
        is_active: service.is_active,
      });
      setImagePreviews(service.images || []);
      setSelectedFiles([]);
    } else {
      setFormData({
        name: "",
        description: "",
        price_type: "inquiry",
        price: undefined,
        duration: "",
        category_id: 0,
        subcategory_id: 0,
        is_active: true,
      });
      setImagePreviews([]);
      setSelectedFiles([]);
    }
    setErrors({});
  }, [service, isOpen]);

  // Additional effect to handle subcategory loading after formData is set
  useEffect(() => {
    if (service && formData.category_id && subcategories.length > 0) {
      // Check if the current subcategory_id is valid for the loaded subcategories
      const validSubcategory = subcategories.find(
        (sub) =>
          sub.id === formData.subcategory_id &&
          sub.parent_id === formData.category_id
      );

      if (!validSubcategory && formData.subcategory_id !== 0) {
        // Reset subcategory if it's not valid for the current category
        setFormData((prev) => ({
          ...prev,
          subcategory_id: 0,
        }));
      }
    }
  }, [service, formData.category_id, subcategories, formData.subcategory_id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }

    if (!formData.subcategory_id) {
      newErrors.subcategory_id = "Subcategory is required";
    }

    if (
      formData.price_type === "fixed" &&
      (!formData.price || formData.price <= 0)
    ) {
      newErrors.price = "Price is required for fixed price services";
    }

    // Validate files if selected
    selectedFiles.forEach((file, index) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        newErrors[`image_${index}`] = "Image file size must be less than 10MB";
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        newErrors[`image_${index}`] =
          "Only JPEG, PNG, GIF, and WebP images are allowed";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      await onSubmit(
        formData,
        selectedFiles.length > 0 ? selectedFiles : undefined
      );
      onClose();
    } catch (error) {
      console.error("Error submitting service:", error);
      toast.error("Failed to submit service. Please try again.");
    }
  };

  const handleInputChange = (
    field: keyof CreateServiceRequest,
    value: string | number | boolean | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const categoryIdNum = parseInt(categoryId);
    setFormData((prev) => ({
      ...prev,
      category_id: categoryIdNum,
      subcategory_id: 0, // Reset subcategory when category changes
    }));
    setErrors((prev) => ({ ...prev, category_id: "", subcategory_id: "" }));

    // Call the callback to load subcategories for the selected category
    if (onCategoryChange && categoryIdNum > 0) {
      onCategoryChange(categoryIdNum);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);
      setErrors((prev) => ({ ...prev, image: "" }));

      // Create preview URLs
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreviews((prev) => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const priceTypeOptions = [
    { value: "inquiry", label: "Inquiry Based" },
    { value: "fixed", label: "Fixed Price" },
  ];

  const categoryOptions = categories.map((category) => ({
    value: category.id.toString(),
    label: category.name,
  }));

  const subcategoryOptions = subcategories.map((subcategory) => ({
    value: subcategory.id.toString(),
    label: subcategory.name,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {service ? "Edit Service" : "Create Service"}
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
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("name", e.target.value)
                    }
                    placeholder="Enter service name"
                    error={errors.name}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Type *
                  </label>
                  <SearchableDropdown
                    options={priceTypeOptions}
                    value={formData.price_type}
                    onChange={(value) =>
                      handleInputChange("price_type", value as string)
                    }
                    placeholder="Select price type"
                    className={errors.price_type ? "border-red-500" : ""}
                    width="100%"
                  />
                </div>
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
                  placeholder="Enter service description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.price_type === "fixed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) *
                    </label>
                    <Input
                      type="number"
                      value={formData.price || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "price",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      error={errors.price}
                    />
                  </div>
                )}

                {formData.price_type === "fixed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <DurationPicker
                      value={formData.duration}
                      onChange={(duration) =>
                        handleInputChange("duration", duration)
                      }
                      placeholder="Select service duration"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Category and Subcategory */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Category & Subcategory
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <SearchableDropdown
                    options={categoryOptions}
                    value={formData.category_id.toString()}
                    onChange={(value) => handleCategoryChange(value as string)}
                    placeholder="Select category"
                    className={errors.category_id ? "border-red-500" : ""}
                    width="100%"
                  />
                  {errors.category_id && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.category_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory *
                  </label>
                  <SearchableDropdown
                    options={subcategoryOptions}
                    value={formData.subcategory_id.toString()}
                    onChange={(value) =>
                      handleInputChange(
                        "subcategory_id",
                        parseInt(value as string)
                      )
                    }
                    placeholder="Select subcategory"
                    disabled={
                      !formData.category_id || subcategories.length === 0
                    }
                    className={errors.subcategory_id ? "border-red-500" : ""}
                    width="100%"
                  />
                  {errors.subcategory_id && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.subcategory_id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Service Images
              </h3>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        width={100}
                        height={100}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={handleImageClick}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              <div
                onClick={handleImageClick}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Upload Service Images
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, WebP up to 10MB
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Form Actions - Fixed at bottom */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t rounded-b-lg  border-gray-200 bg-white">
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
            {service ? "Update Service" : "Create Service"}
          </Button>
        </div>
      </div>
    </div>
  );
}
