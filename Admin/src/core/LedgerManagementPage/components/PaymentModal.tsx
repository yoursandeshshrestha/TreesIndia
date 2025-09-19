"use client";

import React, { useState, useEffect } from "react";
import { X, IndianRupee, TrendingUp, TrendingDown } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import { LedgerEntry, ProcessPaymentRequest } from "../types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcess: (data: ProcessPaymentRequest) => Promise<void>;
  entry: LedgerEntry | null;
  isLoading?: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onProcess,
  entry,
  isLoading = false,
}: PaymentModalProps) {
  const [formData, setFormData] = useState<ProcessPaymentRequest>({
    amount: 0,
    payment_source: "cash",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isReceive = entry?.entry_type === "receive";
  const maxAmount = isReceive
    ? entry?.amount_to_receive
    : entry?.amount_to_be_paid;

  useEffect(() => {
    if (entry) {
      setFormData({
        amount: 0,
        payment_source: "cash",
        notes: "",
      });
      setErrors({});
    }
  }, [entry, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (maxAmount && formData.amount > maxAmount) {
      newErrors.amount = `Amount cannot exceed ${maxAmount}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onProcess(formData);
      onClose();
    } catch (error) {
      console.error("Error processing payment:", error);
      // Error handling is done in the parent component
      // The error will be displayed in toast by the useLedger hook
    }
  };

  const handleInputChange = (
    field: keyof ProcessPaymentRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <div className="flex items-center">
            {isReceive ? (
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {isReceive ? "Process Receive" : "Process Payment"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Entry Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="font-medium">{entry.name}</div>
              {entry.description && (
                <div className="mt-1">{entry.description}</div>
              )}
              <div className="mt-2">
                {isReceive ? (
                  <div>
                    To Receive: ₹
                    {entry.amount_to_receive?.toLocaleString() || "0"}
                    {entry.amount_received && entry.amount_received > 0 && (
                      <div className="text-green-600">
                        Already Received: ₹
                        {entry.amount_received.toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    To Pay: ₹{entry.amount_to_be_paid?.toLocaleString() || "0"}
                    {entry.amount_paid && entry.amount_paid > 0 && (
                      <div className="text-red-600">
                        Already Paid: ₹{entry.amount_paid.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {isReceive ? "Amount to Receive" : "Amount to Pay"} *
              </label>
              <Input
                type="number"
                step="1"
                min="0"
                max={maxAmount}
                value={formData.amount || ""}
                onChange={(e) =>
                  handleInputChange("amount", parseInt(e.target.value) || 0)
                }
                placeholder="0"
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
              {maxAmount && (
                <p className="text-xs text-gray-500">
                  Maximum: ₹{maxAmount.toLocaleString()}
                </p>
              )}
            </div>

            {/* Payment Source */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Payment Source *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.payment_source === "cash"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-300 text-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    value="cash"
                    checked={formData.payment_source === "cash"}
                    onChange={(e) =>
                      handleInputChange("payment_source", e.target.value)
                    }
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-5 w-5" />
                    <span className="font-medium">Cash</span>
                  </div>
                </label>

                <label
                  className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.payment_source === "bank"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-300 text-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    value="bank"
                    checked={formData.payment_source === "bank"}
                    onChange={(e) =>
                      handleInputChange("payment_source", e.target.value)
                    }
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-5 w-5" />
                    <span className="font-medium">Bank</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Enter notes"
                rows={3}
              />
            </div>
          </form>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 rounded-b-lg border-t border-gray-200 bg-white sticky bottom-0 z-floating">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {isReceive ? "Process Receive" : "Process Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
