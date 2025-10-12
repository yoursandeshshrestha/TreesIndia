"use client";

import React from "react";
import { ProjectFormData } from "@/types/projectForm";
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
  formData: ProjectFormData;
  onUpdate: (data: Partial<ProjectFormData>) => void;
  errors: string[];
}

export default function BasicDetailsStep({
  formData,
  onUpdate,
  errors,
}: BasicDetailsStepProps) {
  const handleInputChange = (
    field: keyof ProjectFormData,
    value: string | boolean
  ) => {
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
        Tell us about your project
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: "#666", fontSize: { xs: "0.875rem", sm: "1rem" } }}
      >
        Help us understand what you&apos;re working on
      </Typography>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}
      >
        {/* Project Title */}
        <TextField
          label="Project Title"
          required
          fullWidth
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="e.g., Modern Residential Complex Development"
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

        {/* Project Description */}
        <TextField
          label="Description"
          required
          fullWidth
          multiline
          rows={4}
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe your project in detail..."
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

        {/* Project Type */}
        <FormControl
          component="fieldset"
          error={errors.includes("project_type")}
        >
          <FormLabel
            component="legend"
            sx={{
              mb: 1,
              fontWeight: 500,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Project Type *
          </FormLabel>
          <RadioGroup
            value={formData.project_type}
            onChange={(e) => handleInputChange("project_type", e.target.value)}
            sx={{
              gap: { xs: 1, sm: 2 },
              flexDirection: { xs: "column", sm: "row" },
            }}
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
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
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
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
            />
            <FormControlLabel
              value="infrastructure"
              control={
                <Radio
                  sx={{
                    color: "#00a871",
                    "&.Mui-checked": { color: "#00a871" },
                  }}
                />
              }
              label="Infrastructure"
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
            />
          </RadioGroup>
          {errors.includes("project_type") && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              Project type is required
            </Typography>
          )}
        </FormControl>

        {/* Project Status */}
        <FormControl component="fieldset" error={errors.includes("status")}>
          <FormLabel
            component="legend"
            sx={{
              mb: 1,
              fontWeight: 500,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Project Status *
          </FormLabel>
          <RadioGroup
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            sx={{
              gap: { xs: 1, sm: 2 },
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <FormControlLabel
              value="starting_soon"
              control={
                <Radio
                  sx={{
                    color: "#00a871",
                    "&.Mui-checked": { color: "#00a871" },
                  }}
                />
              }
              label="Starting Soon"
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
            />
            <FormControlLabel
              value="on_going"
              control={
                <Radio
                  sx={{
                    color: "#00a871",
                    "&.Mui-checked": { color: "#00a871" },
                  }}
                />
              }
              label="On Going"
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
            />
          </RadioGroup>
          {errors.includes("status") && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              Project status is required
            </Typography>
          )}
        </FormControl>
      </Box>
    </Box>
  );
}
