import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import Image from "next/image";

interface FileUploadItemProps {
  field: string;
  label: string;
  error?: string;
  file: File | null;
  onFileChange: (field: string, file: File | null) => void;
  maxSize?: number; // in MB
}

const FileUploadItem: React.FC<FileUploadItemProps> = ({
  field,
  label,
  error,
  file,
  onFileChange,
  maxSize,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Handle file selection with size validation
  const handleFileChange = (selectedFile: File | null) => {
    // Clear any previous errors
    setFileError(null);

    if (selectedFile && maxSize) {
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        // Show error immediately and prevent file selection
        setFileError(
          `File size must be less than ${maxSize}MB (Selected: ${fileSizeMB.toFixed(
            2
          )}MB)`
        );
        // Clear the input value to prevent the file from being selected
        const input = document.getElementById(field) as HTMLInputElement;
        if (input) {
          input.value = "";
        }
        return;
      }
    }

    // Only call onFileChange if file passes validation
    onFileChange(field, selectedFile);
  };

  // Create preview URL when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  return (
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-medium text-gray-700">
        {label} *
      </label>

      {previewUrl ? (
        // Show preview when file is uploaded
        <div className="border-2 border-gray-300 rounded-lg p-3 sm:p-4">
          <div className="space-y-3">
            <div className="relative w-full h-24 sm:h-32">
              <Image
                src={previewUrl}
                alt={`${label} preview`}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <button
                type="button"
                onClick={() => {
                  onFileChange(field, null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs"
                title="Remove file"
              >
                ×
              </button>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                {file?.name}
              </p>
              <p className="text-xs text-gray-500">
                {file?.size ? (file.size / 1024 / 1024).toFixed(2) : "0"} MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById(field)?.click()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              Change File
            </button>
          </div>
        </div>
      ) : (
        // Show upload area when no file
        <div
          className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center transition-colors ${
            fileError
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-green-500"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
            id={field}
          />
          <label htmlFor={field} className="cursor-pointer">
            <div className="space-y-2">
              <div className="mx-auto w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  Upload {label}
                </p>
                <p className="text-xs text-gray-500">Click to select file</p>
              </div>
            </div>
          </label>
        </div>
      )}

      {error && <p className="text-red-600 text-xs sm:text-sm mt-2">{error}</p>}
      {fileError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-xs sm:text-sm font-medium">
            {fileError}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadItem;
