"use client";

import React from "react";
import { PropertyFormData } from "@/types/propertyForm";
import {
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Box,
  Typography,
} from "@mui/material";

interface BasicDetailsStepProps {
  formData: PropertyFormData;
  onUpdate: (data: Partial<PropertyFormData>) => void;
  errors: string[];
}

export default function BasicDetailsStep({
  formData,
  onUpdate,
  errors,
}: BasicDetailsStepProps) {
  const handleInputChange = (
    field: keyof PropertyFormData,
    value: string | boolean
  ) => {
    onUpdate({ [field]: value });
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 600, color: "#1a1a1a", mt: 0 }}
      >
        Tell us about your property
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#666" }}>
        Help us understand what you&apos;re listing
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Property Title */}
        <TextField
          label="Property Title"
          required
          fullWidth
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="e.g., Beautiful 3BHK Apartment in Prime Location"
          error={errors.includes("title")}
          helperText={
            errors.includes("title")
              ? "Title is required"
              : `${formData.title.length}/50 characters`
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

        {/* Property Description */}
        <TextField
          label="Description"
          required
          fullWidth
          multiline
          rows={4}
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe your property in detail..."
          error={errors.includes("description")}
          helperText={
            errors.includes("description")
              ? "Description is required"
              : `${formData.description.length}/500 characters`
          }
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

        {/* Property Type */}
        <FormControl
          component="fieldset"
          error={errors.includes("property_type")}
        >
          <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
            Property Type *
          </FormLabel>
          <RadioGroup
            row
            value={formData.property_type}
            onChange={(e) => handleInputChange("property_type", e.target.value)}
            sx={{ gap: 2 }}
          >
            <FormControlLabel
              value="residential"
              control={
                <Radio
                  sx={{
                    color: "#00a871",
                    "&.Mui-checked": { color: "#00a871" },
                  }}
                />
              }
              label="Residential"
            />
            <FormControlLabel
              value="commercial"
              control={
                <Radio
                  sx={{
                    color: "#00a871",
                    "&.Mui-checked": { color: "#00a871" },
                  }}
                />
              }
              label="Commercial"
            />
          </RadioGroup>
          {errors.includes("property_type") && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              Property type is required
            </Typography>
          )}
        </FormControl>

        {/* Listing Type */}
        <FormControl
          component="fieldset"
          error={errors.includes("listing_type")}
        >
          <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
            Listing Type *
          </FormLabel>
          <RadioGroup
            row
            value={formData.listing_type}
            onChange={(e) => handleInputChange("listing_type", e.target.value)}
            sx={{ gap: 2 }}
          >
            <FormControlLabel
              value="sale"
              control={
                <Radio
                  sx={{
                    color: "#00a871",
                    "&.Mui-checked": { color: "#00a871" },
                  }}
                />
              }
              label="For Sale"
            />
            <FormControlLabel
              value="rent"
              control={
                <Radio
                  sx={{
                    color: "#00a871",
                    "&.Mui-checked": { color: "#00a871" },
                  }}
                />
              }
              label="For Rent"
            />
          </RadioGroup>
          {errors.includes("listing_type") && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              Listing type is required
            </Typography>
          )}
        </FormControl>
      </Box>
    </Box>
  );
}
