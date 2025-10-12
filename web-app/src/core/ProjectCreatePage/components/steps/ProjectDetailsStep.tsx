"use client";

import React from "react";
import { ProjectFormData } from "@/types/projectForm";
import { TextField, Box, Typography } from "@mui/material";

interface ProjectDetailsStepProps {
  formData: ProjectFormData;
  onUpdate: (data: Partial<ProjectFormData>) => void;
  errors: string[];
}

export default function ProjectDetailsStep({
  formData,
  onUpdate,
  errors,
}: ProjectDetailsStepProps) {
  const updateContactInfo = (field: string, value: string) => {
    onUpdate({
      contact_info: {
        ...formData.contact_info,
        [field]: value,
      },
    });
  };

  return (
    <Box sx={{ maxWidth: { xs: "100%", sm: 600 } }}>
      <Typography
        variant="h4"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: "#1a1a1a",
          fontSize: { xs: "1.5rem", sm: "2rem" },
        }}
      >
        Project Details & Contact Information
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: "#666", fontSize: { xs: "0.875rem", sm: "1rem" } }}
      >
        Add timeline and contact details for your project
      </Typography>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}
      >
        {/* Estimated Duration */}
        <TextField
          label="Estimated Duration (Days)"
          fullWidth
          type="number"
          value={formData.estimated_duration_days || ""}
          onChange={(e) =>
            onUpdate({
              estimated_duration_days: e.target.value
                ? parseInt(e.target.value)
                : undefined,
            })
          }
          placeholder="Enter estimated duration in days"
          helperText="Optional: How many days do you estimate this project will take?"
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

        {/* Contact Information Section */}
        <Box sx={{ mt: { xs: 1, sm: 2 } }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 500,
              color: "#1a1a1a",
              fontSize: { xs: "1.125rem", sm: "1.25rem" },
            }}
          >
            Contact Information
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: "#666",
              fontSize: { xs: "0.875rem", sm: "0.875rem" },
            }}
          >
            This information will be displayed on your project listing for
            potential clients to contact you.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 2, sm: 3 },
            }}
          >
            {/* Contact Person */}
            <TextField
              label="Contact Person *"
              fullWidth
              value={formData.contact_info.contact_person || ""}
              onChange={(e) =>
                updateContactInfo("contact_person", e.target.value)
              }
              placeholder="Enter contact person name"
              variant="outlined"
              error={errors.some((err) => err.includes("Contact person"))}
              helperText={
                errors.find((err) => err.includes("Contact person")) || ""
              }
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

            {/* Phone Number */}
            <TextField
              label="Phone Number *"
              fullWidth
              type="tel"
              value={formData.contact_info.phone || ""}
              onChange={(e) => updateContactInfo("phone", e.target.value)}
              placeholder="Enter phone number"
              variant="outlined"
              error={errors.some((err) => err.includes("Phone number"))}
              helperText={
                errors.find((err) => err.includes("Phone number")) || ""
              }
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

            {/* Email Address */}
            <TextField
              label="Email Address"
              fullWidth
              type="email"
              value={formData.contact_info.email || ""}
              onChange={(e) => updateContactInfo("email", e.target.value)}
              placeholder="Enter email address"
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

            {/* Alternative Number */}
            <TextField
              label="Alternative Number (Optional)"
              fullWidth
              type="tel"
              value={formData.contact_info.alternative_number || ""}
              onChange={(e) =>
                updateContactInfo("alternative_number", e.target.value)
              }
              placeholder="Enter alternative phone number"
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
      </Box>
    </Box>
  );
}
