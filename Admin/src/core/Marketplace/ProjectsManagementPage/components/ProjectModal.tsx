"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, MapPin, Building, Clock, User } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectType,
  ProjectStatus,
} from "../types";
import Image from "next/image";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSubmit: (
    data: CreateProjectRequest | UpdateProjectRequest,
    imageFiles?: File[]
  ) => Promise<void>;
  isLoading?: boolean;
}

export function ProjectModal({
  isOpen,
  onClose,
  project,
  onSubmit,
  isLoading = false,
}: ProjectModalProps) {
  const [formData, setFormData] = useState<CreateProjectRequest>({
    title: "",
    description: "",
    project_type: "residential",
    status: "starting_soon",
    state: "",
    city: "",
    address: "",
    pincode: "",
    estimated_duration_days: undefined,
    contact_info: {
      phone: "",
      email: "",
      contact_person: "",
      alternative_contact: "",
    },
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || "",
        project_type: project.project_type,
        status: project.status,
        state: project.state,
        city: project.city,
        address: project.address || "",
        pincode: project.pincode || "",
        estimated_duration_days: project.estimated_duration_days,
        contact_info: {
          phone: project.contact_info?.phone || "",
          email: project.contact_info?.email || "",
          contact_person: project.contact_info?.contact_person || "",
          alternative_contact: project.contact_info?.alternative_contact || "",
        },
      });
      setImagePreviews(project.images || []);
      setSelectedFiles([]);
    } else {
      setFormData({
        title: "",
        description: "",
        project_type: "residential",
        status: "starting_soon",
        state: "",
        city: "",
        address: "",
        pincode: "",
        estimated_duration_days: undefined,
        contact_info: {
          phone: "",
          email: "",
          contact_person: "",
          alternative_contact: "",
        },
      });
      setImagePreviews([]);
      setSelectedFiles([]);
    }
    setErrors({});
  }, [project, isOpen]);

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
    if (errors[`contact_info.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`contact_info.${field}`]: "",
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

    if (
      formData.contact_info?.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_info.email)
    ) {
      newErrors["contact_info.email"] = "Please enter a valid email address";
    }

    if (
      formData.contact_info?.phone &&
      !/^[0-9+\-\s()]+$/.test(formData.contact_info.phone)
    ) {
      newErrors["contact_info.phone"] = "Please enter a valid phone number";
    }

    // Validate minimum image requirement
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

    try {
      // Clean up contact_info - remove empty fields
      const cleanedContactInfo = Object.fromEntries(
        Object.entries(formData.contact_info || {}).filter(
          ([, value]) => value && value.trim() !== ""
        )
      );

      const submitData = {
        ...formData,
        contact_info:
          Object.keys(cleanedContactInfo).length > 0
            ? cleanedContactInfo
            : undefined,
      };

      await onSubmit(
        submitData,
        selectedFiles.length > 0 ? selectedFiles : undefined
      );
      onClose();
    } catch (error) {
      console.error("Error submitting project:", error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? "Edit Project" : "Create Project"}
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
                <Building className="h-5 w-5 mr-2" />
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
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Project Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <SearchableDropdown
                    options={statusOptions}
                    value={formData.status}
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
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="Enter estimated duration in days"
                  />
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

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <Input
                    type="text"
                    value={formData.contact_info?.contact_person || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleContactInfoChange("contact_person", e.target.value)
                    }
                    placeholder="Enter contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.contact_info?.phone || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleContactInfoChange("phone", e.target.value)
                    }
                    placeholder="Enter phone number"
                    error={errors["contact_info.phone"]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.contact_info?.email || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleContactInfoChange("email", e.target.value)
                    }
                    placeholder="Enter email address"
                    error={errors["contact_info.email"]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternative Contact
                  </label>
                  <Input
                    type="text"
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
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Project Images
              </h3>

              <div className="space-y-4">
                <div
                  onClick={handleImageClick}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload project images
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

                {errors.images && (
                  <p className="text-red-500 text-sm mt-2">{errors.images}</p>
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
              : project
              ? "Update Project"
              : "Create Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}
