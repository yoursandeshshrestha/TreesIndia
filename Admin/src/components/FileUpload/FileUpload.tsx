"use client";

import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  showPreview?: boolean;
  previewUrl?: string;
  onRemove?: () => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = "",
  showPreview = true,
  previewUrl = "",
  onRemove,
  disabled = false,
  label = "Upload File",
  description = "Click to upload",
}) => {
  const [preview, setPreview] = useState<string>(previewUrl);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      setError(
        `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      );
      return;
    }

    // Validate file type for images
    if (accept.includes("image/*") && !file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    setError("");

    // Create preview for images
    if (showPreview && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    onFileSelect(file);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setPreview("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Preview */}
      {showPreview && preview && (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={preview}
              alt="File preview"
              fill
              className="object-cover"
            />
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-white text-black rounded-full p-1 hover:bg-red-600 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={handleClick}
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload;
