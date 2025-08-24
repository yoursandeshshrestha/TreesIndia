"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import { BaseInput as Input } from "@/components/Input";
import Textarea from "@/components/Textarea/Base/Textarea";
import { OptimizedBookingResponse } from "@/types/booking";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface QuoteModalProps {
  booking: OptimizedBookingResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuoteModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: QuoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    notes: "",
    expires_in: "7", // Default 7 days
  });

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/admin/bookings/${booking.id}/provide-quote`,
        {
          amount: parseFloat(formData.amount),
          notes: formData.notes,
          expires_in: parseInt(formData.expires_in),
        }
      );

      toast.success("Quote provided successfully");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Quote submission error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to provide quote";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <div className="flex items-center">
            <span className="text-2xl text-green-600 mr-2">₹</span>
            <h2 className="text-xl font-semibold text-gray-900">
              Provide Quote
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Booking Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Booking Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>Service:</strong> {booking.service.name}
                  </p>
                  <p>
                    <strong>Customer:</strong>{" "}
                    {booking.user?.name || "Not provided"}
                  </p>
                  <p>
                    <strong>Contact:</strong>{" "}
                    {booking.user?.phone ||
                      booking.contact?.phone ||
                      "Not provided"}
                  </p>
                  <p>
                    <strong>Reference:</strong> {booking.booking_reference}
                  </p>
                </div>
              </div>
            </div>

            {/* Quote Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Quote Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Amount (₹) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("amount", e.target.value)
                  }
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("notes", e.target.value)
                  }
                  placeholder="Add any additional notes or conditions..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires In (Days)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.expires_in}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("expires_in", e.target.value)
                  }
                  placeholder="7"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Form Actions - Fixed at bottom */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t rounded-b-lg border-gray-200 bg-white">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Provide Quote
          </Button>
        </div>
      </div>
    </div>
  );
}
