"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Textarea from "@/components/Textarea/Base/Textarea";
import DurationPicker from "@/components/DurationPicker";
import { PaymentSegmentManager } from "@/components/PaymentSegment";
import {
  OptimizedBookingResponse,
  PaymentSegmentRequest,
} from "@/types/booking";
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
    notes: "",
    duration: "", // Service duration for single segment quotes
  });
  const [segments, setSegments] = useState<PaymentSegmentRequest[]>([
    { amount: 0, notes: "" },
  ]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    // Calculate total amount from segments
    const totalAmount = segments.reduce(
      (sum, segment) => sum + (segment.amount || 0),
      0
    );

    // Validate segments
    if (totalAmount <= 0) {
      toast.error("Total quote amount must be greater than 0");
      return;
    }

    if (segments.some((segment) => !segment.amount || segment.amount <= 0)) {
      toast.error("All segments must have a valid amount greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/admin/bookings/${booking.ID}/provide-quote`, {
        notes: formData.notes,
        segments: segments,
        duration: formData.duration || undefined, // Only send if duration is provided
      });

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

  const handleSegmentsChange = (newSegments: PaymentSegmentRequest[]) => {
    setSegments(newSegments);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <div className="flex items-center">
            <span className="text-2xl text-green-600 mr-2">₹</span>
            <h2 className="text-xl font-semibold text-gray-900">
              Provide Quote
            </h2>
            <span className="ml-4 text-sm font-medium text-gray-500">
              Total: ₹
              {segments
                .reduce((sum, segment) => sum + (segment.amount || 0), 0)
                .toFixed(2)}
            </span>
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

              {/* Service Duration - Only show for single segment quotes */}
              {segments.length === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Duration (Optional)
                  </label>
                  <DurationPicker
                    value={formData.duration}
                    onChange={(duration) =>
                      handleInputChange("duration", duration)
                    }
                    placeholder="Select service duration"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Specify the duration to help calculate accurate time slot
                    availability
                  </p>
                </div>
              )}
            </div>

            {/* Payment Segments */}
            <div className="space-y-4">
              <PaymentSegmentManager
                segments={segments}
                onSegmentsChange={handleSegmentsChange}
              />
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
