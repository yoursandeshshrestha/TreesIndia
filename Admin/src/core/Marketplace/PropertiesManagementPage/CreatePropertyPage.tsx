"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import {
  CreatePropertyRequest,
  PropertyType,
  ListingType,
  PropertyStatus,
  FurnishingStatus,
} from "./types";
import { apiClient } from "@/lib/api-client";
import Image from "next/image";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreatePropertyRequest>({
    title: "",
    description: "",
    property_type: "residential",
    listing_type: "sale",
    sale_price: undefined,
    monthly_rent: undefined,
    price_negotiable: true,
    bedrooms: undefined,
    bathrooms: undefined,
    area: undefined,
    parking_spaces: undefined,
    floor_number: undefined,
    age: undefined,
    furnishing_status: undefined,
    state: "",
    city: "",
    address: "",
    pincode: "",
    status: "available",
    uploaded_by_admin: true,
    priority_score: 50,
    subscription_required: false,
    treesindia_assured: true, // Admin-created properties get TreesIndia Assured tag
    user_id: 1, // Default admin user ID
  });

  const handleInputChange = (
    field: string,
    value: string | number | boolean | undefined
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (formData.listing_type === "sale" && !formData.sale_price) {
      newErrors.sale_price = "Sale price is required for sale listings";
    }

    if (formData.listing_type === "rent" && !formData.monthly_rent) {
      newErrors.monthly_rent = "Monthly rent is required for rental listings";
    }

    // Validate minimum image requirement
    if (selectedFiles.length < 2) {
      newErrors.images = "At least 2 images are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let response;

      if (selectedFiles.length > 0) {
        // Use FormData for file uploads
        const formDataToSend = new FormData();

        // Append all property data
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === "boolean") {
              formDataToSend.append(key, value.toString());
            } else if (typeof value === "object" && Array.isArray(value)) {
              formDataToSend.append(key, JSON.stringify(value));
            } else {
              formDataToSend.append(key, value.toString());
            }
          }
        });

        // Append image files
        selectedFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });

        response = await apiClient.post("/admin/properties", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Use JSON for data without files
        response = await apiClient.post("/admin/properties", formData);
      }

      if (response.data.success) {
        toast.success("Property created successfully");
        router.push("/dashboard/marketplace/rental-property/all");
      } else {
        throw new Error(response.data.message || "Failed to create property");
      }
    } catch (err: unknown) {
      console.error("Property creation error:", err);

      // Handle API error response
      if (err && typeof err === "object" && "response" in err) {
        const errorResponse = err as {
          response?: {
            data?: { success?: boolean; message?: string; error?: string };
          };
        };
        const { message, error } = errorResponse.response?.data || {};

        // Display the specific error message from the API
        if (error) {
          toast.error(error);

          // If it's an image validation error, also set it in the form errors
          if (error.includes("images") || error.includes("image")) {
            setErrors((prev) => ({ ...prev, images: error }));
          }
        } else if (message) {
          toast.error(message);
        } else {
          toast.error("Failed to create property");
        }
      } else if (err && typeof err === "object" && "message" in err) {
        const errorMessage = err as { message: string };
        toast.error(errorMessage.message);
      } else {
        toast.error("Failed to create property");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });

      // Clear images error when files are added
      if (errors.images) {
        setErrors((prev) => ({
          ...prev,
          images: "",
        }));
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    // Clear images error when files are removed (if we have enough images)
    if (selectedFiles.length > 2 && errors.images) {
      setErrors((prev) => ({
        ...prev,
        images: "",
      }));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const propertyTypeOptions = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
  ];

  const listingTypeOptions = [
    { value: "sale", label: "For Sale" },
    { value: "rent", label: "For Rent" },
  ];

  const statusOptions = [
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
    { value: "rented", label: "Rented" },
  ];

  const furnishingOptions = [
    { value: "furnished", label: "Furnished" },
    { value: "semi_furnished", label: "Semi Furnished" },
    { value: "unfurnished", label: "Unfurnished" },
  ];

  const ageOptions = [
    { value: "under_1_year", label: "Under 1 Year" },
    { value: "1_2_years", label: "1-2 Years" },
    { value: "2_5_years", label: "2-5 Years" },
    { value: "10_plus_years", label: "10+ Years" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" ">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Property
              </h1>
              <p className="text-sm text-gray-500">
                Add a new property listing to the marketplace
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
                    Property Title *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("title", e.target.value)
                    }
                    placeholder="Enter property title"
                    error={errors.title}
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <SearchableDropdown
                    options={propertyTypeOptions}
                    value={formData.property_type}
                    onChange={(value) =>
                      handleInputChange("property_type", value as PropertyType)
                    }
                    placeholder="Select property type"
                    className={errors.property_type ? "border-red-500" : ""}
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
                  placeholder="Enter property description"
                  rows={3}
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Property Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Listing Type *
                  </label>
                  <SearchableDropdown
                    options={listingTypeOptions}
                    value={formData.listing_type}
                    onChange={(value) =>
                      handleInputChange("listing_type", value as ListingType)
                    }
                    placeholder="Select listing type"
                    width="100%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <SearchableDropdown
                    options={statusOptions}
                    value={formData.status}
                    onChange={(value) =>
                      handleInputChange("status", value as PropertyStatus)
                    }
                    placeholder="Select status"
                    width="100%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Furnishing Status
                  </label>
                  <SearchableDropdown
                    options={furnishingOptions}
                    value={formData.furnishing_status || ""}
                    onChange={(value) =>
                      handleInputChange(
                        "furnishing_status",
                        value as FurnishingStatus
                      )
                    }
                    placeholder="Select furnishing"
                    width="100%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <Input
                    type="number"
                    value={formData.bedrooms || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        "bedrooms",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="Number of bedrooms"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <Input
                    type="number"
                    value={formData.bathrooms || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        "bathrooms",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="Number of bathrooms"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area (sq ft)
                  </label>
                  <Input
                    type="number"
                    value={formData.area || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        "area",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="Area in square feet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parking Spaces
                  </label>
                  <Input
                    type="number"
                    value={formData.parking_spaces || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        "parking_spaces",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="Number of parking spaces"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Number
                  </label>
                  <Input
                    type="number"
                    value={formData.floor_number || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        "floor_number",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="Floor number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <SearchableDropdown
                    options={ageOptions}
                    value={formData.age || ""}
                    onChange={(value) =>
                      handleInputChange(
                        "age",
                        value as
                          | "under_1_year"
                          | "1_2_years"
                          | "2_5_years"
                          | "10_plus_years"
                      )
                    }
                    placeholder="Select age"
                    width="100%"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Pricing</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.listing_type === "sale" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Price (₹) *
                    </label>
                    <Input
                      type="number"
                      value={formData.sale_price || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "sale_price",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      placeholder="Enter sale price"
                      error={errors.sale_price}
                    />
                  </div>
                )}

                {formData.listing_type === "rent" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Rent (₹) *
                    </label>
                    <Input
                      type="number"
                      value={formData.monthly_rent || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "monthly_rent",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      placeholder="Enter monthly rent"
                      error={errors.monthly_rent}
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="price_negotiable"
                    checked={formData.price_negotiable}
                    onChange={(e) =>
                      handleInputChange("price_negotiable", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="price_negotiable"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Price is negotiable
                  </label>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <Input
                    type="text"
                    value={formData.state}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("state", e.target.value)
                    }
                    placeholder="Enter state"
                    error={errors.state}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("city", e.target.value)
                    }
                    placeholder="Enter city"
                    error={errors.city}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <Input
                    type="text"
                    value={formData.pincode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("pincode", e.target.value)
                    }
                    placeholder="Enter pincode"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Textarea
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("address", e.target.value)
                  }
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Property Images
              </h3>

              <div className="space-y-4">
                <div
                  onClick={handleImageClick}
                  className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors ${
                    errors.images
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload property images
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG up to 10MB each (Minimum 2 images required)
                  </p>
                  {errors.images && (
                    <p className="mt-2 text-sm text-red-600">{errors.images}</p>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push("/dashboard/marketplace/rental-property/all")
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Property
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
