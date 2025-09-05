"use client";

import React from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { PaymentProgress as PaymentProgressType } from "@/types/booking";

interface PaymentProgressProps {
  progress: PaymentProgressType;
  showSegments?: boolean;
  className?: string;
}

export default function PaymentProgress({
  progress,
  showSegments = true,
  className = "",
}: PaymentProgressProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Progress
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{progress.paid_segments} paid</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span>{progress.remaining_segments} pending</span>
          </div>
          {progress.segments.some((s) => s.is_overdue) && (
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>Overdue</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {progress.progress_percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
              progress.progress_percentage
            )}`}
            style={{ width: `${Math.min(progress.progress_percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Amount Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(progress.total_amount)}
          </div>
          <div className="text-sm text-gray-600">Total Amount</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(progress.paid_amount)}
          </div>
          <div className="text-sm text-gray-600">Paid Amount</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(progress.remaining_amount)}
          </div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
      </div>

      {/* Segments Summary */}
      {showSegments && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Payment Segments
          </h4>
          <div className="space-y-2">
            {progress.segments.map((segment) => (
              <div
                key={segment.id}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">
                    Segment #{segment.segment_number}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      segment.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : segment.status === "overdue"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {segment.status}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(segment.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
