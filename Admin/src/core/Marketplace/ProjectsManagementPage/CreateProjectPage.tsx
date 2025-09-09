"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, X, MapPin, Phone } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import { CreateProjectRequest, ProjectType, ProjectStatus } from "./types";
import { apiClient } from "@/lib/api-client";
import Image from "next/image";

export default function CreateProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateProjectRequest>({
    title: "",
    description: "",
    project_type: "residential",
    status: "starting_soon",
    state: "",
    city: "",
    address: "",
    pincode: "",
    estimated_duration_days: 0,
    contact_info: {
      phone: "",
      email: "",
      alternative_contact: "",
      contact_person: "",
    },
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

  const handleContactInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[`contact_${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`contact_${field}`]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.pincode?.trim()) {
      newErrors.pincode = "Pincode is required";
    }

    if (!formData.contact_info?.phone?.trim()) {
      newErrors.contact_phone = "Contact phone is required";
    }

    if (!formData.contact_info?.contact_person?.trim()) {
      newErrors.contact_person = "Contact person is required";
    }

    // Validate image requirements (min 2, max 7)
    if (selectedFiles.length < 2) {
      newErrors.images = "At least 2 images are required";
    } else if (selectedFiles.length > 7) {
      newErrors.images = "Maximum 7 images allowed";
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

        // Append all project data
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === "boolean") {
              formDataToSend.append(key, value.toString());
            } else if (typeof value === "object" && Array.isArray(value)) {
              formDataToSend.append(key, JSON.stringify(value));
            } else if (typeof value === "object") {
              // Handle contact_info object
              formDataToSend.append(key, JSON.stringify(value));
            } else if (typeof value === "number") {
              // Ensure numbers are properly formatted
              formDataToSend.append(key, value.toString());
            } else {
              formDataToSend.append(key, value.toString());
            }
          }
        });

        // Append image files
        selectedFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });

        response = await apiClient.post("/admin/projects", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Use JSON for data without files
        response = await apiClient.post("/admin/projects", formData);
      }

      if (response.data.success) {
        toast.success("Project created successfully");
        router.push("/dashboard/marketplace/projects");
      } else {
        throw new Error(response.data.message || "Failed to create project");
      }
    } catch (err: unknown) {
      console.error("Project creation error:", err);

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
          toast.error("Failed to create project");
        }
      } else if (err && typeof err === "object" && "message" in err) {
        const errorMessage = err as { message: string };
        toast.error(errorMessage.message);
      } else {
        toast.error("Failed to create project");
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

      // Clear images error when enough files are added
      if (selectedFiles.length >= 2 && errors.images) {
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
    if (selectedFiles.length >= 2 && errors.images) {
      setErrors((prev) => ({
        ...prev,
        images: "",
      }));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const projectTypeOptions = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "infrastructure", label: "Infrastructure" },
  ];

  const statusOptions = [
    { value: "starting_soon", label: "Starting Soon" },
    { value: "on_going", label: "On Going" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "on_hold", label: "On Hold" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" ">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Project
              </h1>
              <p className="text-sm text-gray-500">
                Add a new project to the marketplace
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
                    Project Title *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("title", e.target.value)
                    }
                    placeholder="Enter project title"
                    error={errors.title}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Type *
                  </label>
                  <SearchableDropdown
                    options={projectTypeOptions}
                    value={formData.project_type}
                    onChange={(value) =>
                      handleInputChange("project_type", value as ProjectType)
                    }
                    placeholder="Select project type"
                    className={errors.project_type ? "border-red-500" : ""}
                    width="100%"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter project description"
                  rows={3}
                  error={errors.description}
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Project Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <SearchableDropdown
                    options={statusOptions}
                    value={formData.status || "starting_soon"}
                    onChange={(value) =>
                      handleInputChange("status", value as ProjectStatus)
                    }
                    placeholder="Select status"
                    width="100%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration (Days)
                  </label>
                  <Input
                    type="number"
                    value={formData.estimated_duration_days || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(
                        "estimated_duration_days",
                        e.target.value ? parseInt(e.target.value) : 0
                      )
                    }
                    placeholder="Enter duration in days"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <MapPin size={16} />
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
                    Pincode *
                  </label>
                  <Input
                    type="text"
                    value={formData.pincode || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("pincode", e.target.value)
                    }
                    placeholder="Enter pincode"
                    pattern="[0-9]*"
                    error={errors.pincode}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <Textarea
                  value={formData.address || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("address", e.target.value)
                  }
                  placeholder="Enter full address"
                  rows={2}
                  error={errors.address}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Phone size={16} />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person *
                  </label>
                  <Input
                    type="text"
                    value={formData.contact_info?.contact_person || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleContactInfoChange("contact_person", e.target.value)
                    }
                    placeholder="Enter contact person name"
                    error={errors.contact_person}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.contact_info?.phone || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleContactInfoChange("phone", e.target.value)
                    }
                    placeholder="Enter phone number"
                    error={errors.contact_phone}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.contact_info?.email || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleContactInfoChange("email", e.target.value)
                    }
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternative Contact
                  </label>
                  <Input
                    type="tel"
                    value={formData.contact_info?.alternative_contact || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleContactInfoChange(
                        "alternative_contact",
                        e.target.value
                      )
                    }
                    placeholder="Enter alternative contact"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Project Images
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
                    Click to upload project images
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG up to 10MB each (Minimum 2 images, maximum 7
                    images required)
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
                onClick={() => router.push("/dashboard/marketplace/projects")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Project
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
