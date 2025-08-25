"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Checkbox from "@/components/Checkbox/Checkbox";
import { PromotionBanner, CreateBannerRequest } from "../types";
import Image from "next/image";

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBannerRequest, imageFile?: File) => Promise<void>;
  banner?: PromotionBanner | null;
  isLoading?: boolean;
}

export const BannerModal: React.FC<BannerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  banner,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateBannerRequest>({
    title: "",
    link: "",
    is_active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!banner;

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        link: banner.link || "",
        is_active: banner.is_active,
      });
      setImagePreview(banner.image);
    } else {
      setFormData({
        title: "",
        link: "",
        is_active: true,
      });
      setImagePreview("");
    }
    setSelectedFile(null);
    setErrors({});
  }, [banner, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!selectedFile && !imagePreview && !isEditing) {
      newErrors.image = "Image is required";
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

    try {
      await onSubmit(formData, selectedFile || undefined);
      onClose();
    } catch (error) {
      console.error("Error submitting banner:", error);
    }
  };

  const handleInputChange = (
    field: keyof CreateBannerRequest,
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
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Banner" : "Create Banner"}
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
                  Banner Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("title", e.target.value)
                  }
                  placeholder="Enter banner title"
                  error={errors.title}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.link}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("link", e.target.value)
                  }
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Banner Image {!isEditing && "*"}
            </h3>

            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={imagePreview}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div
                onClick={handleImageClick}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG, WebP up to 10MB
                    </p>
                  </div>
                </div>
              </div>
              {errors.image && (
                <p className="text-sm text-red-600">{errors.image}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Status</h3>
            <Checkbox
              checked={formData.is_active}
              onChange={(checked) => handleInputChange("is_active", checked)}
              label="Active"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isLoading}
              loading={isLoading}
            >
              {isEditing ? "Update Banner" : "Create Banner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
