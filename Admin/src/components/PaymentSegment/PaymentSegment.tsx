"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { BaseInput as Input } from "@/components/Input";
import Button from "@/components/Button/Base/Button";
import { PaymentSegmentRequest } from "@/types/booking";

interface PaymentSegmentProps {
  segment: PaymentSegmentRequest;
  index: number;
  onUpdate: (index: number, segment: PaymentSegmentRequest) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export default function PaymentSegment({
  segment,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: PaymentSegmentProps) {
  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    onUpdate(index, { ...segment, amount });
  };

  const handleNotesChange = (value: string) => {
    onUpdate(index, { ...segment, notes: value });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
            {index + 1}
          </div>
          <h4 className="text-sm font-medium text-gray-900">
            Segment {index + 1}
          </h4>
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Amount (₹) *
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            required
            value={segment.amount || ""}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full text-sm"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Notes
          </label>
          <Input
            value={segment.notes || ""}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Optional notes..."
            className="w-full text-sm"
          />
        </div>
      </div>
    </div>
  );
}
