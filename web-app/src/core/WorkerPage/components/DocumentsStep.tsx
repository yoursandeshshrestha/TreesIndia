"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
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
    <Box sx={{ maxWidth: 600 }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 600, color: "#1a1a1a", mt: 0 }}
      >
        Document Upload
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#666" }}>
        Please upload the required documents for verification.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FileUploadItem
          field="aadhar_card"
          label="Aadhaar Card (Max 1MB)"
          file={formData.aadhar_card ?? null}
          error={errors.aadhar_card}
          onFileChange={onFileChange}
          maxSize={1}
        />

        <FileUploadItem
          field="pan_card"
          label="PAN Card (Max 1MB)"
          file={formData.pan_card ?? null}
          error={errors.pan_card}
          onFileChange={onFileChange}
          maxSize={1}
        />

        <FileUploadItem
          field="profile_pic"
          label="Profile Photo (Max 1MB)"
          file={formData.profile_pic ?? null}
          error={errors.profile_pic}
          onFileChange={onFileChange}
          maxSize={1}
        />

        <FileUploadItem
          field="police_verification"
          label="Police Verification (Max 1MB)"
          file={formData.police_verification ?? null}
          error={errors.police_verification}
          onFileChange={onFileChange}
          maxSize={1}
        />
      </Box>
    </Box>
  );
};

export default DocumentsStep;
