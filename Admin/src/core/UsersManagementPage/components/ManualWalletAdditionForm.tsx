"use client";

import { useState, useEffect } from "react";
import { X, User, FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Textarea from "@/components/Textarea/Base/Textarea";

interface ManualWalletAdditionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser?: {
    id: number;
    name: string;
    email?: string;
    phone: string;
    wallet_balance: number;
  } | null;
}

interface WalletAdditionRequest {
  user_id: number;
  amount: number;
  reason: string;
}

export default function ManualWalletAdditionForm({
  isOpen,
  onClose,
  onSuccess,
  selectedUser,
}: ManualWalletAdditionFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<WalletAdditionRequest>({
    user_id: selectedUser?.id || 0,
    amount: 0,
    reason: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update formData when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        user_id: selectedUser.id,
      }));
    }
  }, [selectedUser]);

  const handleInputChange = (
    field: keyof WalletAdditionRequest,
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

    if (!formData.user_id || formData.user_id === 0) {
      newErrors.user_id = "Please select a user";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount is required and must be greater than 0";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Additional safety check for user_id
    if (!formData.user_id || formData.user_id === 0) {
      toast.error("Invalid user selected. Please close and try again.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/admin/wallet/adjust", {
        user_id: formData.user_id,
        amount: formData.amount,
        reason: formData.reason,
      });
      toast.success("Wallet amount added successfully!");
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to add wallet amount";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      user_id: 0,
      amount: 0,
      reason: "",
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
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Wallet Amount
            </h2>
          </div>
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
          {/* Selected User Info */}
          {selectedUser ? (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 truncate">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-blue-700">
                    {selectedUser.email && `${selectedUser.email} • `}
                    {selectedUser.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Current Balance</p>
                  <p className="text-lg font-semibold text-blue-900">
                    ₹{selectedUser.wallet_balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">
                No user selected. Please close this form and select a user first.
              </p>
            </div>
          )}
          {errors.user_id && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.user_id}</p>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount to Add *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount || ""}
                onChange={(e) =>
                  handleInputChange("amount", parseFloat(e.target.value) || 0)
                }
                placeholder="Enter amount"
                className={`pl-10 ${errors.amount ? "border-red-500" : ""}`}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700"
            >
              Reason for Addition *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Enter reason for adding wallet amount..."
                rows={3}
                className={`pl-10 ${errors.reason ? "border-red-500" : ""}`}
              />
            </div>
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason}</p>
            )}
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This action will permanently add the specified amount to the
                    user&apos;s wallet. This transaction will be recorded and
                    cannot be undone. Please ensure the amount and reason are
                    correct before proceeding.
                  </p>
                </div>
              </div>
            </div>
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
            disabled={isLoading || !selectedUser || formData.amount <= 0}
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
          >
            Add to Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}
