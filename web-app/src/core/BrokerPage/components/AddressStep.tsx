import React from "react";

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
  const address = formData.address ? JSON.parse(formData.address) : {};

  const handleAddressChange = (field: string, value: string) => {
    const updatedAddress = { ...address, [field]: value };
    onFieldChange("address", JSON.stringify(updatedAddress));
  };

  return (
    <div className="space-y-6 text-black">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Address Information
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Please provide your complete residential address.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            value={address.street || ""}
            onChange={(e) => handleAddressChange("street", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.address ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter street address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              value={address.city || ""}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              value={address.state || ""}
              onChange={(e) => handleAddressChange("state", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter state"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode *
            </label>
            <input
              type="text"
              value={address.pincode || ""}
              onChange={(e) => handleAddressChange("pincode", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter pincode"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landmark
            </label>
            <input
              type="text"
              value={address.landmark || ""}
              onChange={(e) => handleAddressChange("landmark", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter landmark (optional)"
            />
          </div>
        </div>

        {errors.address && (
          <p className="text-red-600 text-sm">{errors.address}</p>
        )}
      </div>
    </div>
  );
};

export default AddressStep;
