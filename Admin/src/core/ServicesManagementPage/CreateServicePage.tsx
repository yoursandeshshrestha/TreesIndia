"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Package, Upload, X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import DurationPicker from "@/components/DurationPicker";
import Checkbox from "@/components/Checkbox/Checkbox";
import { Category, Subcategory, CreateServiceRequest } from "./types";
import { apiClient } from "@/lib/api-client";
import Image from "next/image";
import ServiceAreaSelector from "./components/ServiceAreaSelector";

export default function CreateServicePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: "",
    description: "",
    price_type: "inquiry",
    price: undefined,
    duration: "",
    category_id: 0,
    subcategory_id: 0,
    is_active: true,
    service_area_ids: [],
  });

  const loadCategories = async () => {
    if (categories.length > 0) return; // Already loaded

    setIsLoadingCategories(true);
    try {
      const response = await apiClient.get("/services/categories");
      const categories = response.data.data || [];
      setCategories(categories);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadSubcategories = async (categoryId?: number) => {
    setIsLoadingSubcategories(true);
    try {
      let url = "/subcategories";
      if (categoryId) {
        url += `/category/${categoryId}`;
      }
      const response = await apiClient.get(url);
      const subcategories = response.data.data || [];
      setSubcategories(subcategories);
    } catch (error) {
      console.error("Error loading subcategories:", error);
      toast.error("Failed to load subcategories");
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

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

    // Validate service areas
    if (!formData.service_area_ids || formData.service_area_ids.length === 0) {
      newErrors.service_area_ids = "At least one service area is required";
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

    setIsLoading(true);
    try {
      // Prepare the data for submission
      const serviceData = {
        ...formData,
        service_area_ids: formData.service_area_ids,
      };

      let response;
      if (selectedFiles.length > 0) {
        // Use FormData for file upload
        const formDataToSend = new FormData();

        // Add service data as JSON string
        formDataToSend.append("data", JSON.stringify(serviceData));

        // Add images
        selectedFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });

        response = await apiClient.post("/admin/services", formDataToSend);
      } else {
        // Use JSON for data without files
        response = await apiClient.post("/admin/services", serviceData);
      }

      toast.success("Service created successfully!");
      router.push("/dashboard/services");
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("Failed to create service. Please try again.");
    } finally {
      setIsLoading(false);
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

    if (categoryIdNum) {
      // Load subcategories for the selected category
      loadSubcategories(categoryIdNum);
    } else {
      setSubcategories([]);
    }
  };

  const handleServiceAreasChange = (serviceAreaIds: number[]) => {
    setFormData((prev) => ({ ...prev, service_area_ids: serviceAreaIds }));
    if (errors.service_area_ids) {
      setErrors((prev) => ({ ...prev, service_area_ids: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      // Validate each file before adding
      const validFiles: File[] = [];
      const validPreviews: string[] = [];

      files.forEach((file) => {
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          toast.error(
            `File "${file.name}" is too large. Maximum size is 10MB.`
          );
          return;
        }

        // Check file type
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File "${file.name}" is not a supported image type.`);
          return;
        }

        validFiles.push(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (event) => {
          validPreviews.push(event.target?.result as string);
          setImagePreviews((prev) => [...prev, ...validPreviews]);
        };
        reader.readAsDataURL(file);
      });

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }

    // Reset the input value to allow selecting the same file again
    e.target.value = "";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" ">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Service
              </h1>
              <p className="text-sm text-gray-500">
                Add a new service to your platform
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                    loading={isLoadingCategories}
                    onOpen={loadCategories}
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
                    loading={isLoadingSubcategories}
                  />
                  {errors.subcategory_id && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.subcategory_id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Service Areas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Service Areas
              </h3>
              <ServiceAreaSelector
                selectedServiceAreaIds={formData.service_area_ids}
                onChange={handleServiceAreasChange}
                errors={errors}
              />
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                      Selected Images ({imagePreviews.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles([]);
                        setImagePreviews([]);
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                          <Image
                            src={preview}
                            width={200}
                            height={200}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload area */}
              <div
                onClick={handleImageClick}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Upload Service Images
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, WebP up to 10MB per image
                </p>
                {imagePreviews.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2">
                    {imagePreviews.length} image(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/services")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Service
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
