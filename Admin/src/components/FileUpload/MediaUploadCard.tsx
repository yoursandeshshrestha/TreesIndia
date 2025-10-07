"use client";

import React, { useRef } from "react";
import { Upload, Video } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadCardProps {
  onMediaSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
  allowVideo?: boolean;
}

export const MediaUploadCard: React.FC<MediaUploadCardProps> = ({
  onMediaSelect,
  accept = "image/*,video/*",
  maxSize = 50 * 1024 * 1024, // 50MB default
  className = "",
  disabled = false,
  label = "Upload Media",
  description = "Click to browse or drag and drop",
  allowVideo = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine if it's an image or video
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    // Validate file type
    if (!isImage && !isVideo) {
      toast.error("Please select a valid image or video file");
      return;
    }

    if (isVideo && !allowVideo) {
      toast.error("Video uploads are not allowed");
      return;
    }

    // Validate file size (different limits for images and videos)
    const imageMaxSize = 5 * 1024 * 1024; // 5MB for images
    const videoMaxSize = 50 * 1024 * 1024; // 50MB for videos

    if (isImage && file.size > imageMaxSize) {
      toast.error(
        `Image size must be less than ${Math.round(
          imageMaxSize / (1024 * 1024)
        )}MB`
      );
      return;
    }

    if (isVideo && file.size > videoMaxSize) {
      toast.error(
        `Video size must be less than ${Math.round(
          videoMaxSize / (1024 * 1024)
        )}MB`
      );
      return;
    }

    // Validate video format
    if (isVideo) {
      const validVideoTypes = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/avi",
        "video/x-msvideo",
      ];
      if (!validVideoTypes.includes(file.type)) {
        toast.error("Please select a valid video format (MP4, WebM, MOV, AVI)");
        return;
      }
    }

    onMediaSelect(file);

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
      className={`border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-blue-400 hover:bg-blue-50 transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
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
        className="flex flex-col items-center space-y-3 w-full"
      >
        {/* Upload Icon */}
        <div className="flex gap-2">
          <Upload className="w-12 h-12 text-gray-400" />
          {allowVideo && <Video className="w-12 h-12 text-gray-400" />}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>

        {/* Instructions */}
        <p className="text-sm text-gray-600 text-center">{description}</p>

        {/* File Type and Size Info */}
        <p className="text-xs text-gray-500 text-center">
          {allowVideo
            ? "Images (PNG, JPG, WebP) up to 5MB or Videos (MP4, WebM, MOV) up to 50MB"
            : `PNG, JPG, WebP up to ${Math.round(maxSize / (1024 * 1024))}MB`}
        </p>
      </div>
    </div>
  );
};

export default MediaUploadCard;
