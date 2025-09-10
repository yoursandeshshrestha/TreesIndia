"use client";

import React, { useState } from "react";
import { ProjectFormData } from "@/types/projectForm";
import { TextField, Box, Typography, Button } from "@mui/material";
import { Target, Loader2 } from "lucide-react";
import { useLocation } from "@/hooks/useLocationRedux";
import { toast } from "sonner";

interface LocationDetailsStepProps {
  formData: ProjectFormData;
  onUpdate: (data: Partial<ProjectFormData>) => void;
  errors: string[];
}

export default function LocationDetailsStep({
  formData,
  onUpdate,
  errors,
}: LocationDetailsStepProps) {
  const { detectLocation } = useLocation();
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    onUpdate({ [field]: value });
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);

    try {
      const detectedLocation = await detectLocation();

      if (detectedLocation) {
        onUpdate({
          address: detectedLocation.address || "",
          city: detectedLocation.city,
          state: detectedLocation.state,
          pincode: detectedLocation.postal_code || "",
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
        sx={{ mb: 1, fontWeight: 600, color: "#1a1a1a" }}
      >
        Where is your project located?
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: "#666" }}>
        An accurate location helps you connect with the right clients.
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
        {/* Address */}
        <TextField
          label="Address"
          required
          fullWidth
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="e.g., 123 Main Street, Near Metro Station"
          error={errors.includes("address")}
          helperText={errors.includes("address") ? "Address is required" : ""}
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

        {/* City */}
        <TextField
          label="City"
          required
          fullWidth
          value={formData.city}
          onChange={(e) => handleInputChange("city", e.target.value)}
          placeholder="e.g., Mumbai"
          error={errors.includes("city")}
          helperText={errors.includes("city") ? "City is required" : ""}
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

        {/* State */}
        <TextField
          label="State"
          required
          fullWidth
          value={formData.state}
          onChange={(e) => handleInputChange("state", e.target.value)}
          placeholder="e.g., Maharashtra"
          error={errors.includes("state")}
          helperText={errors.includes("state") ? "State is required" : ""}
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

        {/* Pincode */}
        <TextField
          label="Pincode"
          required
          fullWidth
          value={formData.pincode}
          onChange={(e) => handleInputChange("pincode", e.target.value)}
          placeholder="e.g., 400001"
          error={errors.includes("pincode")}
          helperText={errors.includes("pincode") ? "Pincode is required" : ""}
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
