"use client";

import React, { useState } from "react";
import { TextField, Box, Typography, Grid, Button } from "@mui/material";
import { Target, Loader2 } from "lucide-react";
import { useLocation } from "@/hooks/useLocationRedux";
import { toast } from "sonner";

// Custom Grid component to handle TypeScript issues
const GridItem = Grid as React.ComponentType<{
  item?: boolean;
  xs?: number;
  sm?: number;
  children?: React.ReactNode;
}>;

interface AddressStepProps {
  formData: {
    address?: string;
  };
  errors: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
}

const AddressStep: React.FC<AddressStepProps> = ({
  formData,
  errors,
  onFieldChange,
}) => {
  const { detectLocation } = useLocation();
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const address = formData.address ? JSON.parse(formData.address) : {};

  const handleAddressChange = (field: string, value: string) => {
    const updatedAddress = { ...address, [field]: value };
    onFieldChange("address", JSON.stringify(updatedAddress));
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);

    try {
      const detectedLocation = await detectLocation();

      if (detectedLocation) {
        const updatedAddress = {
          ...address,
          street: detectedLocation.address || "",
          city: detectedLocation.city,
          state: detectedLocation.state,
          pincode: detectedLocation.postal_code || "",
        };
        onFieldChange("address", JSON.stringify(updatedAddress));
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
        Address Information
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mb: { xs: 2.5, sm: 3 },
          color: "#666",
          fontSize: { xs: "0.875rem", sm: "1rem" },
        }}
      >
        Please provide your complete residential address.
      </Typography>

      {/* Fetch Current Location Button */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Button
          onClick={handleDetectLocation}
          disabled={isDetectingLocation}
          variant="outlined"
          fullWidth
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
            px: { xs: 2.5, sm: 3 },
            py: { xs: 1.25, sm: 1.5 },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            maxWidth: { sm: "fit-content" },
            "&:hover": {
              borderColor: "#008f5f",
              backgroundColor: "#f0fdf4",
            },
            "&:disabled": {
              borderColor: "#e0e0e0",
              color: "#9e9e9e",
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          {isDetectingLocation
            ? "Detecting location..."
            : "Use Current Location"}
        </Button>
      </Box>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}
      >
        <TextField
          label="Street Address"
          required
          type="text"
          value={address.street || ""}
          onChange={(e) => handleAddressChange("street", e.target.value)}
          placeholder="Enter street address"
          error={!!errors.address}
          helperText={errors.address}
          fullWidth
        />

        <Grid container spacing={2}>
          <GridItem item xs={12} sm={6}>
            <TextField
              label="City"
              required
              type="text"
              value={address.city || ""}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              placeholder="Enter city"
              error={!!errors.address}
              fullWidth
            />
          </GridItem>
          <GridItem item xs={12} sm={6}>
            <TextField
              label="State"
              required
              type="text"
              value={address.state || ""}
              onChange={(e) => handleAddressChange("state", e.target.value)}
              placeholder="Enter state"
              error={!!errors.address}
              fullWidth
            />
          </GridItem>
        </Grid>

        <Grid container spacing={2}>
          <GridItem item xs={12} sm={6}>
            <TextField
              label="Pincode"
              required
              type="text"
              value={address.pincode || ""}
              onChange={(e) => handleAddressChange("pincode", e.target.value)}
              placeholder="Enter pincode"
              error={!!errors.address}
              fullWidth
            />
          </GridItem>
          <GridItem item xs={12} sm={6}>
            <TextField
              label="Landmark (Optional)"
              type="text"
              value={address.landmark || ""}
              onChange={(e) => handleAddressChange("landmark", e.target.value)}
              placeholder="Enter landmark"
              fullWidth
            />
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default AddressStep;
