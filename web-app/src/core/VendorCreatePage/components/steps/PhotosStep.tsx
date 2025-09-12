"use client";

import React, { useRef } from "react";
import { VendorFormData } from "@/types/vendorForm";
import { Upload, X, Image as ImageIcon, User } from "lucide-react";
import Image from "next/image";

interface PhotosStepProps {
  formData: VendorFormData;
  onUpdate: (data: Partial<VendorFormData>) => void;
  errors: string[];
}

export default function PhotosStep({
  formData,
  onUpdate,
  errors,
}: PhotosStepProps) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePictureSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB limit

      if (isValidType && isValidSize) {
        onUpdate({ profile_picture: file });
      } else {
        alert("Please select a valid image file under 2MB");
      }
    }
  };

  const handleGallerySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      const newImages = [...formData.business_gallery, ...validFiles].slice(
        0,
        7
      ); // Max 7 images
      onUpdate({ business_gallery: newImages });
    }
  };

  const removeProfilePicture = () => {
    onUpdate({ profile_picture: null });
  };

  const removeGalleryImage = (index: number) => {
    const newImages = formData.business_gallery.filter((_, i) => i !== index);
    onUpdate({ business_gallery: newImages });
  };

  const openProfileDialog = () => {
    profileInputRef.current?.click();
  };

  const openGalleryDialog = () => {
    galleryInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Business Photos
        </h2>
        <p className="text-gray-600">
          Upload a profile picture and business gallery photos (max 2MB each)
        </p>
      </div>

      {/* Profile Picture Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Picture
        </h3>
        <p className="text-sm text-gray-600">
          Upload a profile picture for your business (optional)
        </p>

        {formData.profile_picture ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  width={96}
                  height={96}
                  src={URL.createObjectURL(formData.profile_picture)}
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {formData.profile_picture.name}
              </p>
              <p className="text-xs text-gray-500">
                {(formData.profile_picture.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeProfilePicture}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <div
            onClick={openProfileDialog}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors max-w-md"
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Upload Profile Picture
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 2MB</p>
          </div>
        )}

        <input
          ref={profileInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfilePictureSelect}
          className="hidden"
        />
      </div>

      {/* Business Gallery Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Business Gallery
        </h3>
        <p className="text-sm text-gray-600">
          Upload photos of your business (0-7 images, max 2MB each)
        </p>

        {/* Upload Area */}
        <div
          onClick={openGalleryDialog}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Upload Business Photos
          </p>
          <p className="text-sm text-gray-500">
            Click to browse or drag and drop images here
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, JPEG up to 2MB each
          </p>
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleGallerySelect}
          className="hidden"
        />

        {/* Image Preview Grid */}
        {formData.business_gallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.business_gallery.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    width={200}
                    height={200}
                    src={URL.createObjectURL(file)}
                    alt={`Business image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Photo {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload More Button */}
        {formData.business_gallery.length > 0 &&
          formData.business_gallery.length < 7 && (
            <button
              onClick={openGalleryDialog}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Add More Photos</span>
            </button>
          )}

        {/* Image Count */}
        <div className="text-sm text-gray-500">
          {formData.business_gallery.length} of 7 photos uploaded
        </div>

        {errors.includes("business_gallery") && (
          <p className="text-red-500 text-sm">
            Please upload at least one photo
          </p>
        )}
      </div>
    </div>
  );
}
