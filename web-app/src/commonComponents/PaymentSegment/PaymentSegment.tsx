"use client";

import React from "react";
import { Calendar, Trash2, Edit3 } from "lucide-react";
import { PaymentSegmentInfo } from "@/types/booking";

interface PaymentSegmentProps {
  segment: PaymentSegmentInfo;
  onEdit?: (segment: PaymentSegmentInfo) => void;
  onDelete?: (segmentId: number) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  showActions?: boolean;
}

export default function PaymentSegment({
  segment,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  showActions = true,
}: PaymentSegmentProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Segment Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">
                Segment #{segment.segment_number}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                  segment.status
                )}`}
              >
                {getStatusText(segment.status)}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              ₹{segment.amount.toLocaleString()}
            </span>
          </div>

          {/* Due Date */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Due: {formatDate(segment.due_date)}</span>
            {segment.days_until_due !== undefined &&
              segment.days_until_due < 0 && (
                <span className="text-red-600 font-medium">
                  ({Math.abs(segment.days_until_due)} days overdue)
                </span>
              )}
            {segment.days_until_due !== undefined &&
              segment.days_until_due >= 0 && (
                <span className="text-gray-500">
                  ({segment.days_until_due} days remaining)
                </span>
              )}
          </div>

          {/* Notes */}
          {segment.notes && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Notes:</span> {segment.notes}
            </div>
          )}

          {/* Payment Info */}
          {segment.status === "paid" && segment.paid_at && (
            <div className="text-sm text-green-600">
              Paid on: {new Date(segment.paid_at).toLocaleDateString("en-IN")}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (canEdit || canDelete) && (
          <div className="flex items-center space-x-2 ml-4">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(segment)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit segment"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(segment.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete segment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
