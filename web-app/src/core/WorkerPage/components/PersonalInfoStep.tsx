import React from "react";

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
  const contactInfo = formData.contact_info
    ? JSON.parse(formData.contact_info)
    : {};

  const handleContactInfoChange = (field: string, value: string) => {
    const updatedContactInfo = { ...contactInfo, [field]: value };
    onFieldChange("contact_info", JSON.stringify(updatedContactInfo));
  };

  return (
    <div className="space-y-6 text-black">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Contact Information
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Please provide your alternative contact number for communication.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alternative Phone Number *
          </label>
          <input
            type="tel"
            value={contactInfo.alternative_number || ""}
            onChange={(e) =>
              handleContactInfoChange("alternative_number", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.contact_info ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter alternative phone number"
          />
          {errors.contact_info && (
            <p className="text-red-600 text-sm mt-1">{errors.contact_info}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
