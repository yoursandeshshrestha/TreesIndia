"use client";

import React, { useRef } from "react";
import { Upload } from "lucide-react";

interface ImageUploadCardProps {
  onImageSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export const ImageUploadCard: React.FC<ImageUploadCardProps> = ({
  onImageSelect,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = "",
  disabled = false,
  label = "Upload Service Images",
  description = "Click to browse or drag and drop",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      console.error(
        `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      );
      return;
    }

    // Validate file type for images
    if (accept.includes("image/*") && !file.type.startsWith("image/")) {
      console.error("Please select a valid image file");
      return;
    }

    onImageSelect(file);

    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={`border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-blue-400 hover:bg-blue-50 transition-colors ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <div
        onClick={handleClick}
        className="flex flex-col items-center space-y-3 cursor-pointer w-full"
      >
        {/* Upload Icon */}
        <Upload className="w-12 h-12 text-gray-400" />
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        
        {/* Instructions */}
        <p className="text-sm text-gray-600 text-center">{description}</p>
        
        {/* File Type and Size Info */}
        <p className="text-xs text-gray-500 text-center">
          PNG, JPG, GIF, WebP up to {Math.round(maxSize / (1024 * 1024))}MB per image
        </p>
      </div>
    </div>
  );
};

export default ImageUploadCard;
