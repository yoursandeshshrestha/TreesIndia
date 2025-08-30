import React from "react";

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
    <div className="space-y-6 text-black">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Broker Details
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Please provide your broker license and agency information.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number *
          </label>
          <input
            type="text"
            value={formData.license}
            onChange={(e) => onFieldChange("license", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.license ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your broker license number"
          />
          {errors.license && (
            <p className="text-red-600 text-sm mt-1">{errors.license}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agency Name *
          </label>
          <input
            type="text"
            value={formData.agency}
            onChange={(e) => onFieldChange("agency", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.agency ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your agency name"
          />
          {errors.agency && (
            <p className="text-red-600 text-sm mt-1">{errors.agency}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerDetailsStep;
