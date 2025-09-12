import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ReviewStepProps {
  formData: {
    license?: string;
    agency?: string;
    contact_info?: string;
    address?: string;
    aadhar_card?: File | null;
    pan_card?: File | null;
    profile_pic?: File | null;
  };
  errors: Record<string, string>;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData, errors }) => {
  const contactInfo = formData.contact_info
    ? JSON.parse(formData.contact_info)
    : {};
  const address = formData.address ? JSON.parse(formData.address) : {};

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6 text-black">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Review & Submit
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Please review all the information before submitting your application.
        </p>
      </div>

      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h4 className="text-sm font-medium text-red-800">
              Please fix the following errors:
            </h4>
          </div>
          <ul className="mt-2 space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-sm text-red-700">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Personal Information
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Alternative Phone:</span>
              <span className="text-sm font-medium text-gray-900">
                {contactInfo.alternative_number || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Broker Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Broker Details
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">License Number:</span>
              <span className="text-sm font-medium text-gray-900">
                {formData.license || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Agency Name:</span>
              <span className="text-sm font-medium text-gray-900">
                {formData.agency || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Address Information
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Street:</span>
              <span className="text-sm font-medium text-gray-900">
                {address.street || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">City:</span>
              <span className="text-sm font-medium text-gray-900">
                {address.city || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">State:</span>
              <span className="text-sm font-medium text-gray-900">
                {address.state || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pincode:</span>
              <span className="text-sm font-medium text-gray-900">
                {address.pincode || "Not provided"}
              </span>
            </div>
            {address.landmark && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Landmark:</span>
                <span className="text-sm font-medium text-gray-900">
                  {address.landmark}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Documents
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Aadhaar Card:</span>
              <div className="flex items-center space-x-2">
                {formData.aadhar_card ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">
                      {formData.aadhar_card.name}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-red-600">Not uploaded</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">PAN Card:</span>
              <div className="flex items-center space-x-2">
                {formData.pan_card ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">
                      {formData.pan_card.name}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-red-600">Not uploaded</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profile Photo:</span>
              <div className="flex items-center space-x-2">
                {formData.profile_pic ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">
                      {formData.profile_pic.name}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-red-600">Not uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
