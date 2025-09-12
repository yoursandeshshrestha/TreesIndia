"use client";

import React from "react";
import { TextField, Box, Typography } from "@mui/material";

interface BrokerDetailsStepProps {
  formData: {
    license?: string;
    agency?: string;
  };
  errors: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
}

const BrokerDetailsStep: React.FC<BrokerDetailsStepProps> = ({
  formData,
  errors,
  onFieldChange,
}) => {
  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 600, color: "#1a1a1a", mt: 0 }}
      >
        Broker Details
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#666" }}>
        Please provide your broker license and agency information.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="License Number"
          required
          type="text"
          value={formData.license || ""}
          onChange={(e) => onFieldChange("license", e.target.value)}
          placeholder="Enter your broker license number"
          error={!!errors.license}
          helperText={errors.license}
          fullWidth
        />

        <TextField
          label="Agency Name"
          required
          type="text"
          value={formData.agency || ""}
          onChange={(e) => onFieldChange("agency", e.target.value)}
          placeholder="Enter your agency name"
          error={!!errors.agency}
          helperText={errors.agency}
          fullWidth
        />
      </Box>
    </Box>
  );
};

export default BrokerDetailsStep;
