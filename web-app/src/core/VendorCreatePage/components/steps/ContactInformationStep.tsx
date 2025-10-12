"use client";

import React from "react";
import { VendorFormData } from "@/types/vendorForm";
import { TextField, Box, Typography } from "@mui/material";

interface ContactInformationStepProps {
  formData: VendorFormData;
  onUpdate: (data: Partial<VendorFormData>) => void;
  errors: string[];
}

export default function ContactInformationStep({
  formData,
  onUpdate,
  errors,
}: ContactInformationStepProps) {
  const handleInputChange = (field: keyof VendorFormData, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <Box sx={{ maxWidth: { xs: "100%", sm: 600 } }}>
      <Typography
        variant="h4"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: "#1a1a1a",
          mt: 0,
          fontSize: { xs: "1.5rem", sm: "2rem" },
        }}
      >
        Contact Information
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: "#666", fontSize: { xs: "0.875rem", sm: "1rem" } }}
      >
        How can customers reach you?
      </Typography>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}
      >
        {/* Contact Person Name */}
        <TextField
          label="Contact Person Name"
          required
          fullWidth
          value={formData.contact_person_name}
          onChange={(e) =>
            handleInputChange("contact_person_name", e.target.value)
          }
          placeholder="e.g., John Smith"
          error={errors.includes("contact_person_name")}
          helperText={
            errors.includes("contact_person_name")
              ? "Contact person name is required"
              : `${formData.contact_person_name.length}/50 characters`
          }
          inputProps={{
            maxLength: 50,
          }}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "#00a871",
              },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#00a871",
            },
          }}
        />

        {/* Contact Phone */}
        <TextField
          label="Contact Phone"
          required
          fullWidth
          value={formData.contact_person_phone}
          onChange={(e) =>
            handleInputChange("contact_person_phone", e.target.value)
          }
          placeholder="e.g., +91 9876543210"
          error={errors.includes("contact_person_phone")}
          helperText={
            errors.includes("contact_person_phone")
              ? "Contact phone is required"
              : "Enter a valid phone number"
          }
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "#00a871",
              },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#00a871",
            },
          }}
        />

        {/* Contact Email */}
        <TextField
          label="Contact Email"
          fullWidth
          type="email"
          value={formData.contact_person_email}
          onChange={(e) =>
            handleInputChange("contact_person_email", e.target.value)
          }
          placeholder="e.g., contact@abcconstruction.com"
          error={errors.includes("contact_person_email")}
          helperText={
            errors.includes("contact_person_email")
              ? "Enter a valid email address"
              : "Optional - for business inquiries"
          }
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "#00a871",
              },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#00a871",
            },
          }}
        />
      </Box>
    </Box>
  );
}
