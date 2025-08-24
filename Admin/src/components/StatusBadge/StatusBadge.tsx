import React from "react";

export interface StatusBadgeProps {
  status: string;
  type: "booking" | "payment";
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  className = "",
}) => {
  const getStatusColor = (status: string, type: "booking" | "payment") => {
    if (type === "booking") {
      const bookingStatusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
        quote_provided: "bg-blue-100 text-blue-800 border-blue-300",
        quote_accepted: "bg-green-100 text-green-800 border-green-300",
        confirmed: "bg-indigo-100 text-indigo-800 border-indigo-300",
        scheduled: "bg-purple-100 text-purple-800 border-purple-300",
        assigned: "bg-orange-100 text-orange-800 border-orange-300",
        in_progress: "bg-cyan-100 text-cyan-800 border-cyan-300",
        completed: "bg-green-100 text-green-800 border-green-300",
        cancelled: "bg-red-100 text-red-800 border-red-300",
        rejected: "bg-gray-100 text-gray-800 border-gray-300",
      };
      return (
        bookingStatusColors[status] ||
        "bg-gray-100 text-gray-800 border-gray-300"
      );
    } else {
      const paymentStatusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
        completed: "bg-green-100 text-green-800 border-green-300",
        failed: "bg-red-100 text-red-800 border-red-300",
        refunded: "bg-orange-100 text-orange-800 border-orange-300",
        abandoned: "bg-gray-100 text-gray-800 border-gray-300",
        expired: "bg-red-100 text-red-800 border-red-300",
        hold: "bg-blue-100 text-blue-800 border-blue-300",
      };
      return (
        paymentStatusColors[status] ||
        "bg-gray-100 text-gray-800 border-gray-300"
      );
    }
  };

  const getStatusLabel = (status: string, type: "booking" | "payment") => {
    if (type === "booking") {
      const bookingStatusLabels: Record<string, string> = {
        pending: "Pending",
        quote_provided: "Quote Provided",
        quote_accepted: "Quote Accepted",
        confirmed: "Confirmed",
        scheduled: "Scheduled",
        assigned: "Assigned",
        in_progress: "In Progress",
        completed: "Completed",
        cancelled: "Cancelled",
        rejected: "Rejected",
      };
      return bookingStatusLabels[status] || status;
    } else {
      const paymentStatusLabels: Record<string, string> = {
        pending: "Pending",
        completed: "Completed",
        failed: "Failed",
        refunded: "Refunded",
        abandoned: "Abandoned",
        expired: "Expired",
        hold: "On Hold",
      };
      return paymentStatusLabels[status] || status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
        status,
        type
      )} ${className}`}
    >
      {getStatusLabel(status, type)}
    </span>
  );
};

export default StatusBadge;
