"use client";

import React from "react";
import { VendorFormData } from "@/types/vendorForm";
import { TextField, Box, Typography } from "@mui/material";

interface BasicDetailsStepProps {
  formData: VendorFormData;
  onUpdate: (data: Partial<VendorFormData>) => void;
  errors: string[];
}

export default function BasicDetailsStep({
  formData,
  onUpdate,
  errors,
}: BasicDetailsStepProps) {
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
        Tell us about your business
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: "#666", fontSize: { xs: "0.875rem", sm: "1rem" } }}
      >
        Help us understand your business
      </Typography>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}
      >
        {/* Business Name */}
        <TextField
          label="Business Name"
          required
          fullWidth
          value={formData.vendor_name}
          onChange={(e) => handleInputChange("vendor_name", e.target.value)}
          placeholder="e.g., ABC Construction Services"
          error={errors.includes("vendor_name")}
          helperText={
            errors.includes("vendor_name")
              ? "Business name is required"
              : `${formData.vendor_name.length}/50 characters`
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

        {/* Business Description */}
        <TextField
          label="Business Description"
          fullWidth
          multiline
          rows={4}
          value={formData.business_description}
          onChange={(e) =>
            handleInputChange("business_description", e.target.value)
          }
          placeholder="Describe your business and what services you offer..."
          helperText={`${formData.business_description.length}/500 characters`}
          inputProps={{
            maxLength: 500,
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
      </Box>
    </Box>
  );
}
