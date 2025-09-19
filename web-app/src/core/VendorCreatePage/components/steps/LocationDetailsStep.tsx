"use client";

import React, { useState } from "react";
import { VendorFormData } from "@/types/vendorForm";
import { TextField, Box, Typography, Paper, Button } from "@mui/material";
import { Target, Loader2 } from "lucide-react";
import { useLocation } from "@/hooks/useLocationRedux";
import { toast } from "sonner";

interface LocationDetailsStepProps {
  formData: VendorFormData;
  onUpdate: (data: Partial<VendorFormData>) => void;
  errors: string[];
}

export default function LocationDetailsStep({
  formData,
  onUpdate,
  errors,
}: LocationDetailsStepProps) {
  const { detectLocation } = useLocation();
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleAddressChange = (
    field: keyof typeof formData.business_address,
    value: string
  ) => {
    onUpdate({
      business_address: {
        ...formData.business_address,
        [field]: value,
      },
    });
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);

    try {
      const detectedLocation = await detectLocation();

      if (detectedLocation) {
        onUpdate({
          business_address: {
            ...formData.business_address,
            street: detectedLocation.address || "",
            city: detectedLocation.city,
            state: detectedLocation.state,
            pincode: detectedLocation.postal_code || "",
          },
        });
        toast.success("Location detected successfully!");
      }
    } catch (error) {
      console.error("Location detection error:", error);
      toast.error("Failed to detect location. Please enter address manually.");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 600, color: "#1a1a1a", mt: 0 }}
      >
        Location Details
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: "#666" }}>
        Provide your business address so customers can find you
      </Typography>

      {/* Fetch Current Location Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          onClick={handleDetectLocation}
          disabled={isDetectingLocation}
          variant="outlined"
          startIcon={
            isDetectingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Target className="w-4 h-4" />
            )
          }
          sx={{
            borderColor: "#00a871",
            color: "#00a871",
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 2,
            px: 3,
            py: 1.5,
            "&:hover": {
              borderColor: "#008f5f",
              backgroundColor: "#f0fdf4",
            },
            "&:disabled": {
              borderColor: "#e0e0e0",
              color: "#9e9e9e",
            },
          }}
        >
          {isDetectingLocation
            ? "Detecting Location..."
            : "Fetch My Current Location"}
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Street Address */}
        <TextField
          label="Street Address"
          required
          fullWidth
          value={formData.business_address.street}
          onChange={(e) => handleAddressChange("street", e.target.value)}
          placeholder="e.g., 123 Main Street, Building A"
          error={errors.includes("street")}
          helperText={
            errors.includes("street")
              ? "Street address is required"
              : "Enter your complete street address"
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

        {/* City and State */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            label="City"
            required
            fullWidth
            value={formData.business_address.city}
            onChange={(e) => handleAddressChange("city", e.target.value)}
            placeholder="e.g., Mumbai"
            error={errors.includes("city")}
            helperText={
              errors.includes("city") ? "City is required" : "Enter your city"
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
          <TextField
            label="State"
            required
            fullWidth
            value={formData.business_address.state}
            onChange={(e) => handleAddressChange("state", e.target.value)}
            placeholder="e.g., Maharashtra"
            error={errors.includes("state")}
            helperText={
              errors.includes("state")
                ? "State is required"
                : "Enter your state"
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

        {/* Pincode and Landmark */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            label="Pincode"
            required
            fullWidth
            value={formData.business_address.pincode}
            onChange={(e) => handleAddressChange("pincode", e.target.value)}
            placeholder="e.g., 400001"
            error={errors.includes("pincode")}
            helperText={
              errors.includes("pincode")
                ? "Pincode is required"
                : "Enter your pincode"
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
          <TextField
            label="Landmark"
            fullWidth
            value={formData.business_address.landmark || ""}
            onChange={(e) => handleAddressChange("landmark", e.target.value)}
            placeholder="e.g., Near Central Mall"
            helperText="Optional - nearby landmark for easy identification"
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

        {/* Address Preview */}
        {formData.business_address.street && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: 600, color: "#495057" }}
            >
              Address Preview:
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#6c757d", lineHeight: 1.6 }}
            >
              {formData.business_address.street}
              {formData.business_address.landmark &&
                `, ${formData.business_address.landmark}`}
              <br />
              {formData.business_address.city},{" "}
              {formData.business_address.state} -{" "}
              {formData.business_address.pincode}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
