"use client";

import React from "react";
import { CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react";
import { PaymentProgress as PaymentProgressType } from "@/types/booking";

interface PaymentProgressProps {
  progress: PaymentProgressType;
  className?: string;
}

export default function PaymentProgress({
  progress,
  className = "",
}: PaymentProgressProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-blue-900">
              Payment Progress
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">
              {progress.progress_percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-600">
              {progress.paid_segments}/{progress.total_segments} segments paid
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.progress_percentage}%` }}
          />
        </div>

        {/* Amount Summary */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600">Total</div>
            <div className="font-semibold text-gray-900">
              ₹{progress.total_amount.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-green-600">Paid</div>
            <div className="font-semibold text-green-700">
              ₹{progress.paid_amount.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-red-600">Remaining</div>
            <div className="font-semibold text-red-700">
              ₹{progress.remaining_amount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Segments List */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900">Payment Segments</h4>
        {progress.segments.map((segment) => (
          <div
            key={segment.id}
            className={`border rounded-lg p-3 ${getStatusColor(
              segment.status
            )}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(segment.status)}
                <div>
                  <div className="font-medium">
                    Segment {segment.segment_number}
                  </div>
                  <div className="text-sm opacity-75">
                    ₹{segment.amount.toFixed(2)}
                    {segment.due_date && (
                      <span className="ml-2">
                        Due: {new Date(segment.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium capitalize">{segment.status}</div>
                {segment.paid_at && (
                  <div className="text-xs opacity-75">
                    Paid: {new Date(segment.paid_at).toLocaleDateString()}
                  </div>
                )}
                {segment.is_overdue && segment.status === "pending" && (
                  <div className="text-xs text-red-600">Overdue</div>
                )}
              </div>
            </div>
            {segment.notes && (
              <div className="mt-2 text-sm opacity-75">{segment.notes}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
