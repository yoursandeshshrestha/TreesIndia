import React, { useState } from "react";
import Model from "@/components/Model/Base/Model";
import Button from "@/components/Button/Base/Button";
import Textarea from "@/components/Textarea/Base/Textarea";
import { Calendar, User, Package, X, Loader } from "lucide-react";
import { Booking, getBookingStatusColor } from "@/types/booking";

interface BookingStatusModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (status: string, reason?: string) => Promise<void>;
  isLoading: boolean;
}

const BookingStatusModal: React.FC<BookingStatusModalProps> = ({
  booking,
  isOpen,
  onClose,
  onUpdate,
  isLoading,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(booking.status);
  const [reason, setReason] = useState("");

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      payment_pending: "Payment Pending",
      temporary_hold: "Temporary Hold",
      confirmed: "Confirmed",
      assigned: "Assigned",
      in_progress: "In Progress",
      completed: "Completed",
      time_expired: "Time Expired",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };
    return statusMap[status] || status;
  };

  const bookingStatuses = [
    { value: "pending", label: "Pending" },
    { value: "payment_pending", label: "Payment Pending" },
    { value: "temporary_hold", label: "Temporary Hold" },
    { value: "confirmed", label: "Confirmed" },
    { value: "assigned", label: "Assigned" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "time_expired", label: "Time Expired" },
    { value: "cancelled", label: "Cancelled" },
    { value: "rejected", label: "Rejected" },
  ];

  const handleUpdate = async () => {
    await onUpdate(selectedStatus, reason);

    // Reset form
    setReason("");
  };

  const handleClose = () => {
    setSelectedStatus(booking.status);
    setReason("");
    onClose();
  };

  return (
    <Model isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Update Booking Status
            </h2>
            <p className="text-sm text-gray-600">{booking.booking_reference}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Current Booking Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Current Booking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getBookingStatusColor(
                    booking.status
                  )}`}
                >
                  {getStatusLabel(booking.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Service
                </label>
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <Package className="w-4 h-4 mr-1" />
                  {booking.service.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Customer
                </label>
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {booking.user.name}
                </p>
              </div>
              {booking.scheduled_time && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Scheduled Time
                  </label>
                  <p className="text-sm text-gray-900 mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDateTime(booking.scheduled_time)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {bookingStatuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedStatus === status.value
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-sm font-medium">{status.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {status.value}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Status Change (Optional)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for the status change..."
              rows={3}
            />
          </div>

          {/* Status Change Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Status Change Preview
            </h4>
            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(
                  booking.status
                )}`}
              >
                {getStatusLabel(booking.status)}
              </span>
              <span className="text-blue-600">→</span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(
                  selectedStatus
                )}`}
              >
                {getStatusLabel(selectedStatus)}
              </span>
            </div>
            {reason && (
              <div className="mt-2">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Reason:</span> {reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </div>
      </div>
    </Model>
  );
};

export default BookingStatusModal;
