import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";

interface FileUploadItemProps {
  field: string;
  label: string;
  error?: string;
  file: File | null;
  onFileChange: (field: string, file: File | null) => void;
}

const FileUploadItem: React.FC<FileUploadItemProps> = ({
  field,
  label,
  error,
  file,
  onFileChange,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      <label className="block text-sm font-medium text-gray-700">
        {label} *
      </label>

      {previewUrl ? (
        // Show preview when file is uploaded
        <div className="border-2 border-gray-300 rounded-lg p-4">
          <div className="space-y-3">
            <div className="relative">
              <img
                src={previewUrl}
                alt={`${label} preview`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  onFileChange(field, null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                title="Remove file"
              >
                ×
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 truncate">
                {file?.name}
              </p>
              <p className="text-xs text-gray-500">
                {file?.size ? (file.size / 1024 / 1024).toFixed(2) : "0"} MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById(field)?.click()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Change File
            </button>
          </div>
        </div>
      ) : (
        // Show upload area when no file
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(field, e.target.files?.[0] || null)}
            className="hidden"
            id={field}
          />
          <label htmlFor={field} className="cursor-pointer">
            <div className="space-y-2">
              <div className="mx-auto w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Upload {label}
                </p>
                <p className="text-xs text-gray-500">Click to select file</p>
              </div>
            </div>
          </label>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
};

export default FileUploadItem;
