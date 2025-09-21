"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import {
  ManualTransactionRequest,
  TransactionType,
  TransactionMethod,
  TransactionStatus,
} from "@/types/transaction";

interface ManualTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: "booking", label: "Manual Transaction" },
  { value: "subscription", label: "Subscription Payment" },
  { value: "wallet_recharge", label: "Wallet Recharge" },
  { value: "wallet_debit", label: "Wallet Debit" },
  { value: "segment_pay", label: "Segment Payment" },
  { value: "quote", label: "Quote Payment" },
  { value: "refund", label: "Refund" },
];

const TRANSACTION_METHODS: { value: TransactionMethod; label: string }[] = [
  { value: "admin", label: "Admin Entry" },
  { value: "cash", label: "Cash" },
  { value: "wallet", label: "Wallet" },
  { value: "razorpay", label: "Razorpay" },
];

const TRANSACTION_STATUSES: { value: TransactionStatus; label: string }[] = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function ManualTransactionForm({
  isOpen,
  onClose,
  onSuccess,
}: ManualTransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ManualTransactionRequest>({
    user_id: 1, // Default to admin user
    amount: 0,
    currency: "INR",
    type: "booking", // Use 'booking' type since 'manual' is not in the database constraint
    method: "admin",
    description: "",
    notes: "",
    status: "completed",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: keyof ManualTransactionRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount is required and must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.type) {
      newErrors.type = "Transaction type is required";
    }

    if (!formData.method) {
      newErrors.method = "Payment method is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await api.post(
        "/admin/transactions/manual",
        formData as unknown as Record<string, unknown>
      );
      toast.success("Manual transaction created successfully!");
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to create manual transaction";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      user_id: 1, // Default to admin user
      amount: 0,
      currency: "INR",
      type: "booking", // Use 'booking' type since 'manual' is not in the database constraint
      method: "admin",
      description: "",
      notes: "",
      status: "completed",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Manual Transaction
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount *
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount || ""}
                onChange={(e) =>
                  handleInputChange("amount", parseFloat(e.target.value) || 0)
                }
                placeholder="Enter amount"
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700"
              >
                Currency
              </label>
              <Input
                id="currency"
                value={formData.currency || "INR"}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                placeholder="INR"
              />
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Transaction Type *
              </label>
              <SearchableDropdown
                options={TRANSACTION_TYPES}
                value={formData.type}
                onChange={(value) =>
                  handleInputChange("type", value as TransactionType)
                }
                placeholder="Select transaction type"
                className={errors.type ? "border-red-500" : ""}
              />
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label
                htmlFor="method"
                className="block text-sm font-medium text-gray-700"
              >
                Payment Method *
              </label>
              <SearchableDropdown
                options={TRANSACTION_METHODS}
                value={formData.method}
                onChange={(value) =>
                  handleInputChange("method", value as TransactionMethod)
                }
                placeholder="Select payment method"
                className={errors.method ? "border-red-500" : ""}
              />
              {errors.method && (
                <p className="text-sm text-red-500">{errors.method}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <SearchableDropdown
                options={TRANSACTION_STATUSES}
                value={formData.status}
                onChange={(value) =>
                  handleInputChange("status", value as TransactionStatus)
                }
                placeholder="Select status"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter transaction description"
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes
            </label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter additional notes (optional)"
              rows={2}
            />
          </div>
        </form>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 rounded-b-lg border-t border-gray-200 bg-white sticky bottom-0 z-floating">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Create Transaction
          </Button>
        </div>
      </div>
    </div>
  );
}
