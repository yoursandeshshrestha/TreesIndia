"use client";

import React, { useState, useEffect } from "react";
import { X, IndianRupee } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import { CashBankBalance, UpdateBalanceRequest } from "../types";

interface BalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: UpdateBalanceRequest) => Promise<void>;
  balance: CashBankBalance | null;
  isLoading?: boolean;
}

export default function BalanceModal({
  isOpen,
  onClose,
  onUpdate,
  balance,
  isLoading = false,
}: BalanceModalProps) {
  const [formData, setFormData] = useState<UpdateBalanceRequest>({
    cash_in_hand: 0,
    bank_balance: 0,
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (balance) {
      setFormData({
        cash_in_hand: balance.cash_in_hand,
        bank_balance: balance.bank_balance,
        notes: "",
      });
      setErrors({});
    }
  }, [balance, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if ((formData.cash_in_hand || 0) < 0) {
      newErrors.cash_in_hand = "Cash in hand cannot be negative";
    }

    if ((formData.bank_balance || 0) < 0) {
      newErrors.bank_balance = "Bank balance cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onUpdate(formData);
      onClose();
    } catch {
      // Error handling is done in the parent component
    }
  };

  const handleInputChange = (
    field: keyof UpdateBalanceRequest,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <div className="flex items-center">
            <IndianRupee className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Update Balance
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
          {/* Current Balance Info */}
          {balance && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-2">Current Balance</div>
                <div className="flex justify-between">
                  <span>Cash in Hand:</span>
                  <span className="font-medium">
                    ₹{balance.cash_in_hand.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bank Balance:</span>
                  <span className="font-medium">
                    ₹{balance.bank_balance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-medium">
                    ₹
                    {(
                      balance.cash_in_hand + balance.bank_balance
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cash in Hand */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cash in Hand *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.cash_in_hand || ""}
                onChange={(e) =>
                  handleInputChange(
                    "cash_in_hand",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
                className={errors.cash_in_hand ? "border-red-500" : ""}
              />
              {errors.cash_in_hand && (
                <p className="text-sm text-red-500">{errors.cash_in_hand}</p>
              )}
            </div>

            {/* Bank Balance */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bank Balance *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.bank_balance || ""}
                onChange={(e) =>
                  handleInputChange(
                    "bank_balance",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
                className={errors.bank_balance ? "border-red-500" : ""}
              />
              {errors.bank_balance && (
                <p className="text-sm text-red-500">{errors.bank_balance}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Enter notes about this balance update"
                rows={3}
              />
            </div>

            {/* New Total Preview */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">New Total Balance</div>
                <div className="text-lg font-semibold">
                  ₹
                  {(
                    (formData.cash_in_hand || 0) + (formData.bank_balance || 0)
                  ).toLocaleString()}
                </div>
              </div>
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
            Update Balance
          </Button>
        </div>
      </div>
    </div>
  );
}
