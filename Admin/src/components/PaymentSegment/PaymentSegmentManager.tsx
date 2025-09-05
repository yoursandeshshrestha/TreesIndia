"use client";

import React from "react";
import { Plus, Calculator } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import PaymentSegment from "./PaymentSegment";
import { PaymentSegmentRequest } from "@/types/booking";

interface PaymentSegmentManagerProps {
  segments: PaymentSegmentRequest[];
  onSegmentsChange: (segments: PaymentSegmentRequest[]) => void;
  totalAmount?: number; // Optional for backward compatibility
  onTotalAmountChange?: (amount: number) => void; // Optional for backward compatibility
}

export default function PaymentSegmentManager({
  segments,
  onSegmentsChange,
  totalAmount = 0, // Default value
  onTotalAmountChange = () => {}, // Default empty function
}: PaymentSegmentManagerProps) {
  const addSegment = () => {
    const newSegment: PaymentSegmentRequest = {
      amount: 0,
      notes: "",
    };
    onSegmentsChange([...segments, newSegment]);
  };

  const updateSegment = (
    index: number,
    updatedSegment: PaymentSegmentRequest
  ) => {
    const newSegments = [...segments];
    newSegments[index] = updatedSegment;
    onSegmentsChange(newSegments);

    // Recalculate total amount
    const newTotal = newSegments.reduce(
      (sum, segment) => sum + (segment.amount || 0),
      0
    );
    onTotalAmountChange(newTotal);
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 1) return; // Don't allow removing the last segment

    const newSegments = segments.filter((_, i) => i !== index);
    onSegmentsChange(newSegments);

    // Recalculate total amount
    const newTotal = newSegments.reduce(
      (sum, segment) => sum + (segment.amount || 0),
      0
    );
    onTotalAmountChange(newTotal);
  };

  const calculateTotal = () => {
    return segments.reduce((sum, segment) => sum + (segment.amount || 0), 0);
  };

  const calculatedTotal = calculateTotal();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Payment Breakdown
          </h3>
          <p className="text-sm text-gray-500">
            Split payment into segments or use single payment
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSegment}
          leftIcon={<Plus className="h-4 w-4" />}
          className="flex items-center space-x-1"
        >
          <span>Add</span>
        </Button>
      </div>

      {/* Segments List */}
      <div className="space-y-3">
        {segments.map((segment, index) => (
          <PaymentSegment
            key={index}
            segment={segment}
            index={index}
            onUpdate={updateSegment}
            onRemove={removeSegment}
            canRemove={segments.length > 1}
          />
        ))}
      </div>

      {/* Total Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Total Amount:
          </span>
          <span className="text-lg font-semibold text-gray-900">
            ₹{calculatedTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
