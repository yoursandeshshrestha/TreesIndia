"use client";

import React, { useState, useEffect } from "react";
import { X, IndianRupee, TrendingUp, TrendingDown } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import {
  LedgerEntry,
  CreateLedgerEntryRequest,
  UpdateLedgerEntryRequest,
  LedgerEntryFormData,
} from "../types";

interface LedgerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: CreateLedgerEntryRequest | UpdateLedgerEntryRequest
  ) => Promise<void>;
  entry?: LedgerEntry | null;
  isLoading?: boolean;
}

export default function LedgerEntryModal({
  isOpen,
  onClose,
  onSave,
  entry,
  isLoading = false,
}: LedgerEntryModalProps) {
  const [formData, setFormData] = useState<LedgerEntryFormData>({
    entry_type: "pay",
    name: "",
    description: "",
    amount_to_be_paid: undefined,
    amount_to_receive: undefined,
    amount_paid: undefined,
    amount_received: undefined,
    payment_source: undefined,
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!entry;

  useEffect(() => {
    if (entry) {
      setFormData({
        entry_type: entry.entry_type,
        name: entry.name,
        description: entry.description || "",
        amount_to_be_paid: entry.amount_to_be_paid,
        amount_to_receive: entry.amount_to_receive,
        amount_paid: entry.amount_paid,
        amount_received: entry.amount_received,
        payment_source: entry.payment_source,
        notes: entry.notes || "",
      });
    } else {
      setFormData({
        entry_type: "pay",
        name: "",
        description: "",
        amount_to_be_paid: undefined,
        amount_to_receive: undefined,
        amount_paid: undefined,
        amount_received: undefined,
        payment_source: undefined,
        notes: "",
      });
    }
    setErrors({});
  }, [entry, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.entry_type === "pay" && !formData.amount_to_be_paid) {
      newErrors.amount_to_be_paid =
        "Amount to be paid is required for pay entries";
    }

    if (formData.entry_type === "receive" && !formData.amount_to_receive) {
      newErrors.amount_to_receive =
        "Amount to be received is required for receive entries";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const data = {
        entry_type: formData.entry_type,
        name: formData.name,
        description: formData.description,
        amount_to_be_paid: formData.amount_to_be_paid,
        amount_to_receive: formData.amount_to_receive,
        amount_paid: formData.amount_paid,
        amount_received: formData.amount_received,
        payment_source: formData.payment_source,
        notes: formData.notes,
      };

      await onSave(data);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleInputChange = (
    field: keyof LedgerEntryFormData,
    value: string | number | undefined
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
            {formData.entry_type === "pay" ? (
              <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
            ) : (
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? "Edit Entry" : "Create New Entry"}
            </h2>
          </div>
          <button
            onClick={onClose}
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
          {/* Entry Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Entry Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.entry_type === "pay"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  value="pay"
                  checked={formData.entry_type === "pay"}
                  onChange={(e) =>
                    handleInputChange("entry_type", e.target.value)
                  }
                  className="sr-only"
                />
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5" />
                  <span className="font-medium">Pay</span>
                </div>
              </label>

              <label
                className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.entry_type === "receive"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  value="receive"
                  checked={formData.entry_type === "receive"}
                  onChange={(e) =>
                    handleInputChange("entry_type", e.target.value)
                  }
                  className="sr-only"
                />
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Receive</span>
                </div>
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          {/* Amount Fields */}
          {formData.entry_type === "pay" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount to be Paid *
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.amount_to_be_paid || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "amount_to_be_paid",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="0"
                  className={errors.amount_to_be_paid ? "border-red-500" : ""}
                />
                {errors.amount_to_be_paid && (
                  <p className="text-sm text-red-500">
                    {errors.amount_to_be_paid}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount Paid
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.amount_paid || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "amount_paid",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="0"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount to be Received *
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.amount_to_receive || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "amount_to_receive",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="0"
                  className={errors.amount_to_receive ? "border-red-500" : ""}
                />
                {errors.amount_to_receive && (
                  <p className="text-sm text-red-500">
                    {errors.amount_to_receive}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount Received
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.amount_received || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "amount_received",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Payment Source */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Payment Source
            </label>
            <select
              value={formData.payment_source || ""}
              onChange={(e) =>
                handleInputChange("payment_source", e.target.value || undefined)
              }
              disabled={
                formData.entry_type === "pay"
                  ? !formData.amount_paid || formData.amount_paid <= 0
                  : !formData.amount_received || formData.amount_received <= 0
              }
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                (
                  formData.entry_type === "pay"
                    ? !formData.amount_paid || formData.amount_paid <= 0
                    : !formData.amount_received || formData.amount_received <= 0
                )
                  ? "bg-gray-100 cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              <option value="">Select source</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
            </select>
            {(formData.entry_type === "pay"
              ? !formData.amount_paid || formData.amount_paid <= 0
              : !formData.amount_received || formData.amount_received <= 0) && (
              <p className="text-sm text-gray-500">
                Payment source is only available when amount paid/received is
                more than 0
              </p>
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
              placeholder="Enter notes"
              rows={3}
            />
          </div>
        </form>

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
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
