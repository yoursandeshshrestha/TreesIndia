"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
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

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  parentCategory?: Category | null; // Optional parent for creating nested categories
  categories?: Category[]; // All categories for parent selection
  onSubmit: (
    data: CreateCategoryRequest | UpdateCategoryRequest,
    imageFile?: File
  ) => Promise<void>;
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  parentCategory,
  categories = [],
  onSubmit,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    is_active: true,
    parent_id: null,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to get full path of a category
  const getCategoryPath = (
    category: Category,
    allCategories: Category[]
  ): string => {
    const path: string[] = [category.name];
    let current = category;

    while (current.parent_id) {
      const parent = allCategories.find((c) => c.id === current.parent_id);
      if (parent) {
        path.unshift(parent.name);
        current = parent;
      } else {
        break;
      }
    }

    return path.join(" > ");
  };

  // Get all categories for parent selection (excluding the current category being edited to prevent cycles)
  const availableParentCategories = categories.filter(
    (cat) => !category || cat.id !== category.id
  );

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        icon: category.icon,
        parent_id: category.parent_id ?? null,
        is_active: category.is_active,
      });
      setIconPreview(category.icon || null);
    } else {
      setFormData({
        name: "",
        description: "",
        icon: "",
        parent_id: parentCategory?.id ?? null,
        is_active: true,
      });
      setIconPreview(null);
    }
    setIconFile(null);
    setErrors({});
  }, [category, parentCategory, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
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
      await onSubmit(formData, iconFile || undefined);
      onClose();
    } catch (error) {
      console.error("Error submitting category:", error);
      toast.error("Failed to submit category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    field: keyof CreateCategoryRequest,
    value: string | boolean | number | null
  ) => {
    setFormData((prev) => {
      const updated = { ...prev };
      // Type-safe assignment based on field type
      if (field === "name") {
        updated[field] = value as string;
      } else if (field === "description" || field === "icon") {
        updated[field] = (value as string) || undefined;
      } else if (field === "is_active") {
        updated[field] = value as boolean;
      } else if (field === "parent_id") {
        updated[field] = value as number | null;
      }
      return updated;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              {/* Parent Category Selection - show when creating new or allow changing parent when editing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category {!category ? "(Optional)" : ""}
                </label>
                <select
                  value={formData.parent_id || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "parent_id",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Root Category - Level 1)</option>
                  {availableParentCategories.map((cat) => {
                    const path = getCategoryPath(cat, categories);
                    const indent = cat.parent_id ? "  " : "";
                    return (
                      <option key={cat.id} value={cat.id}>
                        {indent}
                        {path}
                      </option>
                    );
                  })}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {!category
                    ? "Leave empty for root category (Level 1). Select a parent to create a nested category (Level 2, 3, etc.)."
                    : "Select a parent category to move this category under it. Leave empty to make it a root category."}
                </p>
              </div>

              {/* Icon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {iconPreview && (
                    <div className="mt-2">
                      <img
                        src={iconPreview}
                        alt="Icon preview"
                        className="h-16 w-16 object-cover rounded"
                      />
                    </div>
                  )}
                  {formData.icon && !iconPreview && (
                    <div className="mt-2">
                      <img
                        src={formData.icon}
                        alt="Current icon"
                        className="h-16 w-16 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Checkbox
                  checked={formData.is_active}
                  onChange={(e) =>
                    handleInputChange("is_active", e.target.checked)
                  }
                  label="Active"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
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
        </form>
      </div>
    </div>
  );
}
