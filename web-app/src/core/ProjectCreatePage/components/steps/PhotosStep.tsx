"use client";

import React, { useRef } from "react";
import { ProjectFormData } from "@/types/projectForm";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface PhotosStepProps {
  formData: ProjectFormData;
  onUpdate: (data: Partial<ProjectFormData>) => void;
  errors: string[];
}

export default function PhotosStep({
  formData,
  onUpdate,
  errors,
}: PhotosStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 1 * 1024 * 1024; // 1MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      const newImages = [...formData.images, ...validFiles].slice(0, 7); // Max 7 images
      onUpdate({ images: newImages });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    onUpdate({ images: newImages });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Photos</h2>
        <p className="text-gray-600">
          Upload photos of your project (minimum 2, up to 7 images, max 1MB
          each)
        </p>
      </div>

      <div className="space-y-4">
        {/* Upload Area */}
        <div
          onClick={openFileDialog}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Upload Project Photos
          </p>
          <p className="text-sm text-gray-500">
            Click to browse or drag and drop images here
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, JPEG up to 1MB each
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Image Preview Grid */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    width={200}
                    height={200}
                    src={URL.createObjectURL(file)}
                    alt={`Project image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index === 0 ? "Main Photo" : `Photo ${index + 1}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload More Button */}
        {formData.images.length > 0 && formData.images.length < 7 && (
          <button
            onClick={openFileDialog}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Add More Photos</span>
          </button>
        )}

        {/* Image Count */}
        <div className="text-sm text-gray-500">
          {formData.images.length} of 7 photos uploaded
        </div>

        {errors.includes("images") && (
          <p className="text-red-500 text-sm">
            Please upload at least 2 photos
          </p>
        )}
      </div>
    </div>
  );
}
