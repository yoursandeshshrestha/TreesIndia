"use client";

import React, { useState } from "react";
import { PropertyFormData } from "@/types/propertyForm";
import {
  TextField,
  Box,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

interface PropertyProfileStepProps {
  formData: PropertyFormData;
  onUpdate: (data: Partial<PropertyFormData>) => void;
  errors: string[];
}

export default function PropertyProfileStep({
  formData,
  onUpdate,
}: PropertyProfileStepProps) {
  const [showCustomInput, setShowCustomInput] = useState<{
    bedrooms: boolean;
    bathrooms: boolean;
  }>({
    bedrooms: false,
    bathrooms: false,
  });

  const [customValues, setCustomValues] = useState<{
    bedrooms: string;
    bathrooms: string;
  }>({
    bedrooms: "",
    bathrooms: "",
  });

  const handleInputChange = (
    field: keyof PropertyFormData,
    value: string | number
  ) => {
    onUpdate({ [field]: value });
  };

  const handleRoomSelection = (
    field: keyof PropertyFormData,
    value: number
  ) => {
    onUpdate({ [field]: value });
    // Hide custom input when selecting a predefined option
    setShowCustomInput((prev) => ({ ...prev, [field]: false }));
  };

  const handleAddOther = (field: keyof PropertyFormData) => {
    setShowCustomInput((prev) => ({ ...prev, [field]: true }));
  };

  const handleCustomInputChange = (
    field: keyof PropertyFormData,
    value: string
  ) => {
    setCustomValues((prev) => ({ ...prev, [field]: value }));
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      onUpdate({ [field]: numValue });
    }
  };

  const renderRoomSelector = (
    label: string,
    field: keyof PropertyFormData,
    currentValue: number | undefined,
    options: number[]
  ) => (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        {options.map((num) => (
          <Button
            key={num}
            variant={currentValue === num ? "contained" : "outlined"}
            onClick={() => handleRoomSelection(field, num)}
            sx={{
              minWidth: 48,
              height: 48,
              borderRadius: "50%",
              fontSize: "1rem",
              fontWeight: 500,
              border: currentValue === num ? "none" : "1px solid #e0e0e0",
              backgroundColor: currentValue === num ? "#00a871" : "transparent",
              color: currentValue === num ? "white" : "#666",
              "&:hover": {
                backgroundColor: currentValue === num ? "#008f5f" : "#f5f5f5",
                border: currentValue === num ? "none" : "1px solid #00a871",
              },
            }}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="text"
          onClick={() => handleAddOther(field)}
          sx={{
            minWidth: 48,
            height: 48,
            borderRadius: "50%",
            fontSize: "0.75rem",
            border: "none",
            color: "#666",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          + Add other
        </Button>
      </Box>

      {/* Custom Input Field */}
      {showCustomInput[field as keyof typeof showCustomInput] && (
        <Box sx={{ mt: 2, mb: 3, maxWidth: 300 }}>
          <TextField
            label={` ${label.toLowerCase()}`}
            type="number"
            value={customValues[field as keyof typeof customValues]}
            onChange={(e) => handleCustomInputChange(field, e.target.value)}
            placeholder="Enter number"
            variant="outlined"
            size="small"
            fullWidth
            inputProps={{ min: 1, max: 20 }}
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
      )}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 600, color: "#1a1a1a" }}
      >
        Tell us about your property
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#666" }}>
        Add details to help buyers understand your property better
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Room Details Section */}
        <Box>
          {renderRoomSelector(
            "No. of Bedrooms",
            "bedrooms",
            formData.bedrooms,
            [1, 2, 3, 4]
          )}

          {renderRoomSelector(
            "No. of Bathrooms",
            "bathrooms",
            formData.bathrooms,
            [1, 2, 3, 4]
          )}
        </Box>

        {/* Area Details Section */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Add Area Details
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="Carpet Area"
              type="number"
              value={formData.area || ""}
              onChange={(e) =>
                handleInputChange(
                  "area",
                  e.target.value ? parseFloat(e.target.value) : ""
                )
              }
              placeholder="1,434"
              variant="outlined"
              sx={{
                flex: 1,
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
            <TextField
              value="sq.ft."
              variant="outlined"
              disabled
              sx={{
                minWidth: 100,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#f5f5f5",
                },
                "& .MuiOutlinedInput-root.Mui-disabled": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e0e0",
                  },
                },
                "& .MuiInputBase-input.Mui-disabled": {
                  color: "#666",
                  WebkitTextFillColor: "#666",
                },
              }}
            />
          </Box>
        </Box>

        {/* Additional Details */}
        <Box>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
            Additional Details
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
            <TextField
              label="Floor Number"
              type="number"
              value={formData.floor_number || ""}
              onChange={(e) =>
                handleInputChange(
                  "floor_number",
                  e.target.value ? parseInt(e.target.value) : ""
                )
              }
              placeholder="e.g., 5"
              variant="outlined"
              sx={{
                maxWidth: 300,
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
            <FormControl>
              <FormLabel
                id="age-radio-buttons-group-label"
                sx={{
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                Age
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="age-radio-buttons-group-label"
                name="age-radio-buttons-group"
                value={formData.age || ""}
                onChange={(e) => handleInputChange("age", e.target.value)}
              >
                <FormControlLabel
                  value="under_1_year"
                  control={
                    <Radio
                      sx={{
                        color: "#00a871",
                        "&.Mui-checked": {
                          color: "#00a871",
                        },
                      }}
                    />
                  }
                  label="Under 1 year"
                />
                <FormControlLabel
                  value="1_2_years"
                  control={
                    <Radio
                      sx={{
                        color: "#00a871",
                        "&.Mui-checked": {
                          color: "#00a871",
                        },
                      }}
                    />
                  }
                  label="1-2 years"
                />
                <FormControlLabel
                  value="2_5_years"
                  control={
                    <Radio
                      sx={{
                        color: "#00a871",
                        "&.Mui-checked": {
                          color: "#00a871",
                        },
                      }}
                    />
                  }
                  label="2-5 years"
                />
                <FormControlLabel
                  value="10_plus_years"
                  control={
                    <Radio
                      sx={{
                        color: "#00a871",
                        "&.Mui-checked": {
                          color: "#00a871",
                        },
                      }}
                    />
                  }
                  label="10+ years"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Furnishing Status */}
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{
                mb: 1,
                fontWeight: 500,
              }}
            >
              Furnishing Status
            </FormLabel>
            <RadioGroup
              row
              value={formData.furnishing_status || ""}
              onChange={(e) =>
                handleInputChange("furnishing_status", e.target.value)
              }
              sx={{ gap: 2 }}
            >
              <FormControlLabel
                value="furnished"
                control={
                  <Radio
                    sx={{
                      color: "#00a871",
                      "&.Mui-checked": {
                        color: "#00a871",
                      },
                    }}
                  />
                }
                label="Furnished"
              />
              <FormControlLabel
                value="semi_furnished"
                control={
                  <Radio
                    sx={{
                      color: "#00a871",
                      "&.Mui-checked": {
                        color: "#00a871",
                      },
                    }}
                  />
                }
                label="Semi-Furnished"
              />
              <FormControlLabel
                value="unfurnished"
                control={
                  <Radio
                    sx={{
                      color: "#00a871",
                      "&.Mui-checked": {
                        color: "#00a871",
                      },
                    }}
                  />
                }
                label="Unfurnished"
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
}
