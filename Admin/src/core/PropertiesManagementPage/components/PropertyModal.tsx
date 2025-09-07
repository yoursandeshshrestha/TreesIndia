"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Car,
  Square,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import {
  Property,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyType,
  ListingType,
  PropertyStatus,
  FurnishingStatus,
} from "../types";
import Image from "next/image";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onSubmit: (
    data: CreatePropertyRequest | UpdatePropertyRequest,
    imageFiles?: File[]
  ) => Promise<void>;
  isLoading?: boolean;
}

export function PropertyModal({
  isOpen,
  onClose,
  property,
  onSubmit,
  isLoading = false,
}: PropertyModalProps) {
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
    locality: "",
    address: "",
    pincode: "",
    status: "available",
    uploaded_by_admin: true,
    priority_score: 50,
    subscription_required: false,
    treesindia_assured: true, // Admin-created properties get TreesIndia Assured tag
    user_id: 1, // Default admin user ID
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description || "",
        property_type: property.property_type,
        listing_type: property.listing_type,
        sale_price: property.sale_price,
        monthly_rent: property.monthly_rent,
        price_negotiable: property.price_negotiable,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        parking_spaces: property.parking_spaces,
        floor_number: property.floor_number,
        age: property.age,
        furnishing_status: property.furnishing_status,
        state: property.state,
        city: property.city,
        locality: property.locality || "",
        address: property.address || "",
        pincode: property.pincode || "",
        status: property.status,
        uploaded_by_admin: property.uploaded_by_admin,
        priority_score: property.priority_score,
        subscription_required: property.subscription_required,
        treesindia_assured: property.treesindia_assured,
        user_id: property.user_id,
        broker_id: property.broker_id,
      });
      setImagePreviews(property.images || []);
      setSelectedFiles([]);
    } else {
      setFormData({
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
        locality: "",
        address: "",
        pincode: "",
        status: "available",
        uploaded_by_admin: true,
        priority_score: 50,
        subscription_required: false,
        treesindia_assured: true, // Admin-created properties get TreesIndia Assured tag
        user_id: 1,
      });
      setImagePreviews([]);
      setSelectedFiles([]);
    }
    setErrors({});
  }, [property, isOpen]);

  const handleInputChange = (field: string, value: any) => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(
        formData,
        selectedFiles.length > 0 ? selectedFiles : undefined
      );
      onClose();
    } catch (error) {
      console.error("Error submitting property:", error);
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
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <h2 className="text-xl font-semibold text-gray-900">
            {property ? "Edit Property" : "Create Property"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Home className="h-5 w-5 mr-2" />
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
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Square className="h-5 w-5 mr-2" />
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
                    Age (years)
                  </label>
                  <Input
                    type="number"
                    value={formData.age || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        "age",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="Age in years"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing
              </h3>

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
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </h3>

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
                    Locality
                  </label>
                  <Input
                    type="text"
                    value={formData.locality}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("locality", e.target.value)
                    }
                    placeholder="Enter locality"
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
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Property Images
              </h3>

              <div className="space-y-4">
                <div
                  onClick={handleImageClick}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload property images
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG up to 10MB each
                  </p>
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
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading
              ? "Saving..."
              : property
              ? "Update Property"
              : "Create Property"}
          </Button>
        </div>
      </div>
    </div>
  );
}
