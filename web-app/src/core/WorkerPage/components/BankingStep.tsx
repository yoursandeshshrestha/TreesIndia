import React from "react";

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
    <div className="space-y-6 text-black">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Banking Information
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Please provide your bank account details for payments.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name *
          </label>
          <input
            type="text"
            value={bankingInfo.account_holder_name || ""}
            onChange={(e) =>
              handleBankingInfoChange("account_holder_name", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.banking_info ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter account holder name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number *
          </label>
          <input
            type="text"
            value={bankingInfo.account_number || ""}
            onChange={(e) =>
              handleBankingInfoChange("account_number", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.banking_info ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter account number"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code *
            </label>
            <input
              type="text"
              value={bankingInfo.ifsc_code || ""}
              onChange={(e) =>
                handleBankingInfoChange("ifsc_code", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter IFSC code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name *
            </label>
            <input
              type="text"
              value={bankingInfo.bank_name || ""}
              onChange={(e) =>
                handleBankingInfoChange("bank_name", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter bank name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Branch
          </label>
          <input
            type="text"
            value={bankingInfo.bank_branch || ""}
            onChange={(e) =>
              handleBankingInfoChange("bank_branch", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter bank branch (optional)"
          />
        </div>

        {errors.banking_info && (
          <p className="text-red-600 text-sm">{errors.banking_info}</p>
        )}
      </div>
    </div>
  );
};

export default BankingStep;
