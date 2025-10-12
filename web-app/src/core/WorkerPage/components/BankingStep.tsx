"use client";

import React from "react";
import { TextField, Box, Typography } from "@mui/material";

interface BankingStepProps {
  formData: {
    banking_info?: string;
  };
  errors: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
}

const BankingStep: React.FC<BankingStepProps> = ({
  formData,
  errors,
  onFieldChange,
}) => {
  const bankingInfo = formData.banking_info
    ? JSON.parse(formData.banking_info)
    : {};

  const handleBankingInfoChange = (field: string, value: string) => {
    const updatedBankingInfo = { ...bankingInfo, [field]: value };
    onFieldChange("banking_info", JSON.stringify(updatedBankingInfo));
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
        Banking Information
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: "#666", fontSize: { xs: "0.875rem", sm: "1rem" } }}
      >
        Please provide your bank account details for payments.
      </Typography>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}
      >
        <TextField
          label="Account Holder Name"
          required
          type="text"
          value={bankingInfo.account_holder_name || ""}
          onChange={(e) =>
            handleBankingInfoChange("account_holder_name", e.target.value)
          }
          placeholder="Enter account holder name"
          error={!!errors.banking_info}
          helperText={errors.banking_info}
          fullWidth
        />

        <TextField
          label="Account Number"
          required
          type="text"
          value={bankingInfo.account_number || ""}
          onChange={(e) =>
            handleBankingInfoChange("account_number", e.target.value)
          }
          placeholder="Enter account number"
          error={!!errors.banking_info}
          fullWidth
        />

        <TextField
          label="IFSC Code"
          required
          type="text"
          value={bankingInfo.ifsc_code || ""}
          onChange={(e) => handleBankingInfoChange("ifsc_code", e.target.value)}
          placeholder="Enter IFSC code"
          error={!!errors.banking_info}
          fullWidth
        />

        <TextField
          label="Bank Name"
          required
          type="text"
          value={bankingInfo.bank_name || ""}
          onChange={(e) => handleBankingInfoChange("bank_name", e.target.value)}
          placeholder="Enter bank name"
          error={!!errors.banking_info}
          fullWidth
        />
      </Box>
    </Box>
  );
};

export default BankingStep;
