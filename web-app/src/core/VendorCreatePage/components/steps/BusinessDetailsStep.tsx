"use client";

import React, { useState } from "react";
import { VendorFormData } from "@/types/vendorForm";
import {
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Box,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { Plus, X } from "lucide-react";

interface BusinessDetailsStepProps {
  formData: VendorFormData;
  onUpdate: (data: Partial<VendorFormData>) => void;
  errors: string[];
}

const businessTypes = [
  { value: "individual", label: "Individual" },
  { value: "partnership", label: "Partnership" },
  { value: "company", label: "Company" },
  { value: "llp", label: "LLP" },
  { value: "pvt_ltd", label: "Private Limited" },
  { value: "public_ltd", label: "Public Limited" },
  { value: "other", label: "Other" },
];

const constructionMaterials = [
  "Cement Supply",
  "Steel & Iron Rods",
  "Bricks & Blocks",
  "Tiles & Marble",
  "Hardware & Fittings",
  "Sand & Aggregates",
  "Paint & Chemicals",
  "Electrical Materials",
  "Plumbing Supplies",
  "Construction Tools",
];

export default function BusinessDetailsStep({
  formData,
  onUpdate,
  errors,
}: BusinessDetailsStepProps) {
  const [customService, setCustomService] = useState("");

  const handleBusinessTypeChange = (businessType: string) => {
    onUpdate({
      business_type: businessType as
        | "individual"
        | "partnership"
        | "company"
        | "llp"
        | "pvt_ltd"
        | "public_ltd"
        | "other",
    });
  };

  const handleYearsInBusinessChange = (years: number) => {
    onUpdate({ years_in_business: years });
  };

  const handleMaterialToggle = (material: string) => {
    const currentMaterials = formData.services_offered;
    const updatedMaterials = currentMaterials.includes(material)
      ? currentMaterials.filter((m) => m !== material)
      : [...currentMaterials, material];

    onUpdate({ services_offered: updatedMaterials });
  };

  const handleAddCustomService = () => {
    if (
      customService.trim() &&
      !formData.services_offered.includes(customService.trim())
    ) {
      const updatedServices = [
        ...formData.services_offered,
        customService.trim(),
      ];
      onUpdate({ services_offered: updatedServices });
      setCustomService("");
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    const updatedServices = formData.services_offered.filter(
      (service) => service !== serviceToRemove
    );
    onUpdate({ services_offered: updatedServices });
  };

  const handleCustomServiceKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddCustomService();
    }
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
        Business Details
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: "#666", fontSize: { xs: "0.875rem", sm: "1rem" } }}
      >
        Tell us about your business type and the services you offer
      </Typography>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}
      >
        {/* Business Type */}
        <FormControl
          component="fieldset"
          error={errors.includes("business_type")}
        >
          <FormLabel
            component="legend"
            sx={{
              mb: 1,
              fontWeight: 500,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Business Type *
          </FormLabel>
          <RadioGroup
            value={formData.business_type}
            onChange={(e) => handleBusinessTypeChange(e.target.value)}
            sx={{
              gap: { xs: 1, sm: 2 },
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
            }}
          >
            {businessTypes.map((type) => (
              <FormControlLabel
                key={type.value}
                value={type.value}
                control={
                  <Radio
                    sx={{
                      color: "#00a871",
                      "&.Mui-checked": { color: "#00a871" },
                    }}
                  />
                }
                label={type.label}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
              />
            ))}
          </RadioGroup>
          {errors.includes("business_type") && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              Business type is required
            </Typography>
          )}
        </FormControl>

        {/* Years in Business */}
        <TextField
          label="Years in Business"
          type="number"
          fullWidth
          value={formData.years_in_business}
          onChange={(e) =>
            handleYearsInBusinessChange(parseInt(e.target.value) || 0)
          }
          placeholder="0"
          inputProps={{
            min: 0,
            max: 100,
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

        {/* What We Sell */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              fontWeight: 500,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            What We Sell *
          </Typography>

          {/* Predefined Construction Materials */}
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              color: "#666",
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
            }}
          >
            Select from common construction materials:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {constructionMaterials.map((material) => (
              <Chip
                key={material}
                label={material}
                onClick={() => handleMaterialToggle(material)}
                variant={
                  formData.services_offered.includes(material)
                    ? "filled"
                    : "outlined"
                }
                sx={{
                  backgroundColor: formData.services_offered.includes(material)
                    ? "#00a871"
                    : "transparent",
                  color: formData.services_offered.includes(material)
                    ? "white"
                    : "#00a871",
                  borderColor: "#00a871",
                  "&:hover": {
                    backgroundColor: formData.services_offered.includes(
                      material
                    )
                      ? "#008f5f"
                      : "#f0f9f5",
                  },
                }}
              />
            ))}
          </Box>

          {/* Custom Service Input */}
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              color: "#666",
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
            }}
          >
            Or add your own products/services:
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              fullWidth
              placeholder="Enter custom product or service (e.g., Custom Furniture, Solar Panels)"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              onKeyPress={handleCustomServiceKeyPress}
              variant="outlined"
              size="small"
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
            <Button
              variant="contained"
              onClick={handleAddCustomService}
              disabled={
                !customService.trim() ||
                formData.services_offered.includes(customService.trim())
              }
              sx={{
                backgroundColor: "#00a871",
                "&:hover": {
                  backgroundColor: "#008f5f",
                },
                minWidth: "auto",
                px: 2,
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Box>

          {/* Selected Services Display */}
          {formData.services_offered.length > 0 && (
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 500,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                Selected Products/Services:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.services_offered.map((service) => (
                  <Chip
                    key={service}
                    label={service}
                    onDelete={() => handleRemoveService(service)}
                    deleteIcon={<X className="h-3 w-3" />}
                    variant="filled"
                    sx={{
                      backgroundColor: "#00a871",
                      color: "white",
                      "& .MuiChip-deleteIcon": {
                        color: "white",
                        "&:hover": {
                          color: "#f0f0f0",
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {errors.includes("services_offered") && (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: 1, display: "block" }}
            >
              Please select or add at least one product/service
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
