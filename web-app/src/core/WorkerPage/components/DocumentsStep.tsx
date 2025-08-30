import React from "react";
import FileUploadItem from "./FileUploadItem";

interface DocumentsStepProps {
  formData: {
    aadhar_card?: File | null;
    pan_card?: File | null;
    profile_pic?: File | null;
    police_verification?: File | null;
  };
  errors: Record<string, string>;
  onFileChange: (field: string, file: File | null) => void;
}

const DocumentsStep: React.FC<DocumentsStepProps> = ({
  formData,
  errors,
  onFileChange,
}) => {
  return (
    <div className="space-y-6 text-black">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Document Upload
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Please upload the required documents for verification.
        </p>
      </div>

      <div className="space-y-6">
        <FileUploadItem
          field="aadhar_card"
          label="Aadhaar Card"
          file={formData.aadhar_card}
          error={errors.aadhar_card}
          onFileChange={onFileChange}
        />

        <FileUploadItem
          field="pan_card"
          label="PAN Card"
          file={formData.pan_card}
          error={errors.pan_card}
          onFileChange={onFileChange}
        />

        <FileUploadItem
          field="profile_pic"
          label="Profile Photo"
          file={formData.profile_pic}
          error={errors.profile_pic}
          onFileChange={onFileChange}
        />

        <FileUploadItem
          field="police_verification"
          label="Police Verification"
          file={formData.police_verification}
          error={errors.police_verification}
          onFileChange={onFileChange}
        />
      </div>
    </div>
  );
};

export default DocumentsStep;
