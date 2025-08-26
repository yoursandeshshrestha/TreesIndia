"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import {
  Subcategory,
  CreateSubcategoryRequest,
  UpdateSubcategoryRequest,
  Category,
} from "../types";
import Image from "next/image";

interface SubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory?: Subcategory | null;
  parentCategory?: Category | null;
  categories: Category[];
  isLoading?: boolean;
  onSubmit: (
    data: CreateSubcategoryRequest | UpdateSubcategoryRequest,
    imageFile?: File
  ) => Promise<void>;
}

export function SubcategoryModal({
  isOpen,
  onClose,
  subcategory,
  parentCategory,
  categories,
  isLoading = false,
  onSubmit,
}: SubcategoryModalProps) {
  const [formData, setFormData] = useState<CreateSubcategoryRequest>({
    name: "",
    image: "",
    parent_id: 0,
    is_active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        image: subcategory.image || "",
        parent_id: subcategory.parent_id,
        is_active: subcategory.is_active,
      });
      setImagePreview(subcategory.image || "");
      setSelectedFile(null);
    } else {
      setFormData({
        name: "",
        image: "",
        parent_id: parentCategory?.id || 0,
        is_active: true,
      });
      setImagePreview("");
      setSelectedFile(null);
    }
    setErrors({});
  }, [subcategory, parentCategory, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (!formData.parent_id) {
      newErrors.parent_id = "Parent category is required";
    }

    // Validate file if selected
    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        newErrors.image = "Image file size must be less than 10MB";
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        newErrors.image = "Only JPEG, PNG, GIF, and WebP images are allowed";
      }
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
      await onSubmit(formData, selectedFile || undefined);
      onClose();
    } catch (error) {
      console.error("Error submitting subcategory:", error);
      toast.error("Failed to submit subcategory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateSubcategoryRequest,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, image: "" }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 rounded-t-lg border-b border-gray-200 bg-white sticky top-0 z-floating">
          <h2 className="text-xl font-semibold text-gray-900">
            {subcategory ? "Edit Subcategory" : "Create Subcategory"}
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
          {/* Parent Category Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Parent Category
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Parent Category *
              </label>
              {isLoading ? (
                <div className="w-full h-10 bg-gray-100 rounded-md flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className="ml-2 text-sm text-gray-600">
                    Loading categories...
                  </span>
                </div>
              ) : (
                <SearchableDropdown
                  options={categories.map((category) => ({
                    label: category.name,
                    value: category.id.toString(),
                  }))}
                  value={formData.parent_id.toString()}
                  onChange={(value: string | number) =>
                    handleInputChange(
                      "parent_id",
                      typeof value === "string" ? parseInt(value) : value
                    )
                  }
                  placeholder="Select parent category"
                  className="w-full h-10"
                  width="100%"
                />
              )}
              {errors.parent_id && (
                <p className="text-sm text-red-600 mt-1">{errors.parent_id}</p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter subcategory name"
                  error={errors.name}
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Subcategory Image
            </h3>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image preview or upload area */}
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative w-32 h-32">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                    onClick={handleImageClick}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Click image to change or remove</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: Square image (512x512px) • PNG, JPG, GIF, WebP
                    (max 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={handleImageClick}
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 text-center">
                  Upload Icon
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Square image preferred
                </p>
              </div>
            )}

            {errors.image && (
              <p className="text-sm text-red-600">{errors.image}</p>
            )}
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
          >
            {subcategory ? "Update Subcategory" : "Create Subcategory"}
          </Button>
        </div>
      </div>
    </div>
  );
}
