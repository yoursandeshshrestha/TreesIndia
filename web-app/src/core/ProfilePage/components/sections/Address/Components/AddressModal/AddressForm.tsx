import { Loader2 } from "lucide-react";
import { TextField } from "@mui/material";
import { AddressFormData } from "./AddressModal.types";

interface AddressFormProps {
  formData: AddressFormData;
  isCreating: boolean;
  isUpdating: boolean;
  isConfirming: boolean;
  onInputChange: (
    field: keyof AddressFormData,
    value: string | boolean | number
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function AddressForm({
  formData,
  isCreating,
  isUpdating,
  isConfirming,
  onInputChange,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  return (
    <form
      onSubmit={(e) => {
        if (isConfirming) {
          e.preventDefault();
          // Handle confirmation separately
          onSubmit(e);
        } else {
          onSubmit(e);
        }
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TextField
          fullWidth
          label="City"
          value={formData.city}
          onChange={(e) => onInputChange("city", e.target.value)}
          placeholder="City"
          required
          disabled={isConfirming}
          variant="outlined"
          size="medium"
        />
        <TextField
          fullWidth
          label="State"
          value={formData.state}
          onChange={(e) => onInputChange("state", e.target.value)}
          placeholder="State"
          required
          disabled={isConfirming}
          variant="outlined"
          size="medium"
        />
        <TextField
          fullWidth
          label="Postal Code"
          value={formData.postal_code}
          onChange={(e) => onInputChange("postal_code", e.target.value)}
          placeholder="PIN Code"
          required
          variant="outlined"
          size="medium"
        />
      </div>

      <div className="mb-4">
        <TextField
          fullWidth
          label="Street Address"
          value={formData.address}
          onChange={(e) => onInputChange("address", e.target.value)}
          placeholder="e.g., 123 Main Street, Apartment 4B, Downtown Area"
          required
          variant="outlined"
          size="medium"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          fullWidth
          label="House/Flat Number "
          value={formData.house_number}
          onChange={(e) => onInputChange("house_number", e.target.value)}
          placeholder="e.g., 123, Flat 4A"
          variant="outlined"
          size="medium"
        />
        <TextField
          fullWidth
          label="Landmark "
          value={formData.landmark}
          onChange={(e) => onInputChange("landmark", e.target.value)}
          placeholder="e.g., Near City Center Mall"
          variant="outlined"
          size="medium"
        />
      </div>

      <div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Name
          </label>
          <div className="flex flex-wrap gap-2">
            {["Home", "Work", "Other"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onInputChange("name", option);
                  if (option !== "Other") {
                    onInputChange("customName", "");
                  }
                }}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors cursor-pointer flex-1 min-w-0 ${
                  formData.name === option
                    ? "bg-[#00a871] text-white border-[#00a871]"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {formData.name === "Other" && (
          <div className="mt-4">
            <TextField
              fullWidth
              label="Custom Address Name"
              value={formData.customName || ""}
              onChange={(e) => onInputChange("customName", e.target.value)}
              placeholder="Enter custom address name"
              variant="outlined"
              size="medium"
            />
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 py-4">
        <button
          type="submit"
          disabled={
            isCreating ||
            isUpdating ||
            !formData.address.trim() ||
            !formData.city.trim() ||
            !formData.state.trim() ||
            !formData.postal_code.trim() ||
            !formData.name.trim() ||
            (formData.name === "Other" && !(formData.customName || "").trim())
          }
          className="flex-1 bg-[#00a871] hover:bg-[#009a65] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
        >
          {isCreating || isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : isConfirming ? (
            "Update & Confirm Address"
          ) : (
            "Save Address"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
