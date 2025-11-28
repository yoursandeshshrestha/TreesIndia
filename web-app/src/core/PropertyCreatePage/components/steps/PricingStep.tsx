"use client";

import React from "react";
import { PropertyFormData } from "@/types/propertyForm";
import {
  TextField,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
} from "@mui/material";

interface PricingStepProps {
  formData: PropertyFormData;
  onUpdate: (data: Partial<PropertyFormData>) => void;
  errors: string[];
}

export default function PricingStep({
  formData,
  onUpdate,
  errors,
}: PricingStepProps) {
  const handleInputChange = (
    field: keyof PropertyFormData,
    value: string | number | boolean
  ) => {
    onUpdate({ [field]: value });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`;
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
        Set your property price
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: "#666", fontSize: { xs: "0.875rem", sm: "1rem" } }}
      >
        Help buyers understand the value of your property
      </Typography>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}
      >
        {/* Price based on listing type */}
        {formData.listing_type === "sale" ? (
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                fontWeight: 500,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Sale Price *
            </Typography>
            <TextField
              type="number"
              fullWidth
              value={formData.sale_price || ""}
              onChange={(e) =>
                handleInputChange(
                  "sale_price",
                  e.target.value ? parseFloat(e.target.value) || 0 : 0
                )
              }
              placeholder="e.g., 5000000"
              error={errors.includes("sale_price")}
              helperText={
                errors.includes("sale_price") ? "Sale price is required" : ""
              }
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, color: "#666" }}>₹</Typography>
                ),
              }}
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
            {formData.sale_price && (
              <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                {formatPrice(formData.sale_price)}
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                fontWeight: 500,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Monthly Rent *
            </Typography>
            <TextField
              type="number"
              fullWidth
              value={formData.monthly_rent || ""}
              onChange={(e) =>
                handleInputChange(
                  "monthly_rent",
                  e.target.value ? parseFloat(e.target.value) || 0 : 0
                )
              }
              placeholder="e.g., 25000"
              error={errors.includes("monthly_rent")}
              helperText={
                errors.includes("monthly_rent")
                  ? "Monthly rent is required"
                  : ""
              }
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, color: "#666" }}>₹</Typography>
                ),
              }}
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
            {formData.monthly_rent && (
              <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                {formatPrice(formData.monthly_rent)} per month
              </Typography>
            )}
          </Box>
        )}

        {/* Price Negotiable */}
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.price_negotiable}
              onChange={(e) =>
                handleInputChange("price_negotiable", e.target.checked)
              }
              sx={{
                color: "#00a871",
                "&.Mui-checked": {
                  color: "#00a871",
                },
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Price is negotiable
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Allow potential buyers/tenants to negotiate the price
              </Typography>
            </Box>
          }
        />

        {/* Price Summary */}
        {(formData.sale_price || formData.monthly_rent) && (
          <Card
            sx={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
          >
            <CardContent>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 500, color: "#00a871" }}
              >
                Price Summary
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#00a871" }}
              >
                {formData.listing_type === "sale" && formData.sale_price
                  ? formatPrice(formData.sale_price)
                  : formData.listing_type === "rent" && formData.monthly_rent
                  ? `${formatPrice(formData.monthly_rent)}/month`
                  : ""}
              </Typography>
              {formData.price_negotiable && (
                <Typography variant="body2" sx={{ mt: 1, color: "#00a871" }}>
                  Price is negotiable
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
