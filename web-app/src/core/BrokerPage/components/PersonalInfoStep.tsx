"use client";

import React, { useEffect, useMemo } from "react";
import { TextField, Box, Typography } from "@mui/material";
import { useProfile } from "@/hooks/useProfile";

interface PersonalInfoStepProps {
  formData: {
    contact_info?: string;
  };
  errors: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  errors,
  onFieldChange,
}) => {
  const { userProfile } = useProfile();
  const contactInfo = useMemo(() => {
    return formData.contact_info
      ? JSON.parse(formData.contact_info)
      : {};
  }, [formData.contact_info]);

  // Pre-fill form with user profile data if available
  useEffect(() => {
    if (
      userProfile &&
      !contactInfo.name &&
      !contactInfo.email &&
      !contactInfo.phone
    ) {
      const initialContactInfo = {
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        alternative_number: contactInfo.alternative_number || "",
      };
      onFieldChange("contact_info", JSON.stringify(initialContactInfo));
    }
  }, [userProfile, contactInfo, onFieldChange]);

  const handleContactInfoChange = (field: string, value: string) => {
    const updatedContactInfo = { ...contactInfo, [field]: value };
    onFieldChange("contact_info", JSON.stringify(updatedContactInfo));
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 600, color: "#1a1a1a", mt: 0 }}
      >
        Contact Information
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#666" }}>
        Please provide your contact information for communication.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Full Name"
          required
          type="text"
          value={contactInfo.name || ""}
          onChange={(e) => handleContactInfoChange("name", e.target.value)}
          placeholder="Enter your full name"
          error={!!errors.contact_info}
          helperText={errors.contact_info}
          fullWidth
        />

        <TextField
          label="Email Address"
          required
          type="email"
          value={contactInfo.email || ""}
          onChange={(e) => handleContactInfoChange("email", e.target.value)}
          placeholder="Enter your email address"
          error={!!errors.contact_info}
          helperText="Please provide a unique email address that has never been used on the TreesIndia platform. This will be used for all official communications and account verification."
          fullWidth
        />

        <TextField
          label="Phone Number"
          required
          type="tel"
          value={contactInfo.phone || ""}
          placeholder="Your registered phone number"
          error={!!errors.contact_info}
          fullWidth
          disabled
          helperText="This is your registered phone number and cannot be changed"
        />

        <TextField
          label="Alternative Phone Number"
          required
          type="tel"
          value={contactInfo.alternative_number || ""}
          onChange={(e) => {
            // Only allow numbers and + (for international numbers)
            const value = e.target.value.replace(/[^0-9+]/g, "");
            handleContactInfoChange("alternative_number", value);
          }}
          placeholder="Enter alternative phone number (10-20 digits, + allowed)"
          error={!!errors.contact_info}
          fullWidth
          inputProps={{
            minLength: 10,
            maxLength: 21, // +1 for the + character
            pattern: "[+]?[0-9]{10,20}",
          }}
        />
      </Box>
    </Box>
  );
};

export default PersonalInfoStep;
