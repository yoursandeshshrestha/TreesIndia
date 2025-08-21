"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import Checkbox from "@/components/Checkbox/Checkbox";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types";
import Image from "next/image";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSubmit: (
    data: CreateCategoryRequest | UpdateCategoryRequest,
    imageFile?: File
  ) => Promise<void>;
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  onSubmit,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    image: "",
    is_active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        image: category.image || "",
        is_active: category.is_active,
      });
      setImagePreview(category.image || "");
      setSelectedFile(null);
    } else {
      setFormData({
        name: "",
        image: "",
        is_active: true,
      });
      setImagePreview("");
      setSelectedFile(null);
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
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

    setIsLoading(true);
    try {
      await onSubmit(formData, selectedFile || undefined);
      onClose();
    } catch (error) {
      console.error("Error submitting category:", error);
      toast.error("Failed to submit category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateCategoryRequest,
    value: string | boolean
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
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg  border-gray-200 bg-white sticky top-0 z-floating">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? "Edit Category" : "Create Category"}
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
                  Category Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("name", e.target.value)
                  }
                  placeholder="Enter category name"
                  error={errors.name}
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Category Image
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
                <div className="relative">
                  <Image
                    src={imagePreview}
                    width={100}
                    height={100}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleImageClick}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Click image to change or remove</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PNG, JPG, GIF, WebP (max 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={handleImageClick}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Upload Category Image
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, WebP up to 10MB
                </p>
              </div>
            )}

            {errors.image && (
              <p className="text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* Form Actions */}
        </form>
        <div className="flex items-center justify-end space-x-3 p-6 rounded-b-lg border-t border-gray-200 bg-white sticky bottom-0 z-floating">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {category ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </div>
    </div>
  );
}
