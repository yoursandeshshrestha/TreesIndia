"use client";

import React from "react";
import {
  Calendar,
  MapPin,
  Phone,
  FileText,
  Tag,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertTriangle,
  User,
} from "lucide-react";
import type { Booking } from "@/lib/bookingApi";

interface BookingCardProps {
  booking: Booking;
  onCancel?: (booking: Booking) => void;
  onAcceptQuote?: (booking: Booking) => void;
  onRejectQuote?: (booking: Booking) => void;
  showActions?: boolean;
}

export function BookingCard({
  booking,
  onCancel,
  onAcceptQuote,
  onRejectQuote,
  showActions = true,
}: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "confirmed":
      case "scheduled":
      case "assigned":
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "pending":
      case "quote_provided":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "confirmed":
      case "scheduled":
      case "assigned":
      case "in_progress":
        return <ClockIcon className="w-4 h-4" />;
      case "pending":
      case "quote_provided":
        return <AlertTriangle className="w-4 h-4" />;
      case "cancelled":
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "confirmed":
        return "Confirmed";
      case "scheduled":
        return "Scheduled";
      case "assigned":
        return "Worker Assigned";
      case "in_progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "quote_provided":
        return "Quote Provided";
      case "cancelled":
        return "Cancelled";
      case "rejected":
        return "Rejected";
      default:
        return (
          status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
        );
    }
  };

  const formatDate = (
    dateString?: string | null,
    timeString?: string | null
  ) => {
    if (!dateString) return "Not scheduled";

    try {
      const date = new Date(dateString);
      const time = timeString ? new Date(timeString) : null;

      const dateStr = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      if (time) {
        const timeStr = time.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        return `${dateStr} at ${timeStr}`;
      }

      return dateStr;
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatAddress = (addressString: string) => {
    try {
      const address = JSON.parse(addressString);
      const addressName = address.name || "Home";
      const addressText = `${address.address}, ${address.city}`;
      return `${addressName} • ${addressText}`;
    } catch (error) {
      return "Address not available";
    }
  };

  const formatContact = (contactPerson: string, contactPhone: string) => {
    if (!contactPerson && !contactPhone) return null;
    const person = contactPerson || "Contact";
    const phone = contactPhone || "";
    return `${person} • ${phone}`;
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getBookingTypeText = (bookingType: string) => {
    return bookingType === "inquiry" ? "Inquiry" : "Regular";
  };

  const getPaymentStatusText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "completed":
        return "Paid";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const canCancel = (status: string) => {
    return ["pending", "confirmed", "scheduled", "quote_provided"].includes(
      status
    );
  };

  const canAcceptRejectQuote = (status: string) => {
    return status === "quote_provided";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Service Name and Status Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {booking.service?.name || "Service"}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
              booking.status
            )}`}
          >
            {getStatusIcon(booking.status)}
            {getStatusText(booking.status)}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {getBookingTypeText(booking.booking_type)}
          </span>
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-3">
        {/* Date and Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>
              {formatDate(booking.scheduled_date, booking.scheduled_time)}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="truncate">{formatAddress(booking.address)}</span>
          </div>
        </div>

        {/* Contact Person and Phone */}
        {formatContact(booking.contact_person, booking.contact_phone) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>
                {formatContact(booking.contact_person, booking.contact_phone)}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Payment Amount */}
        {booking.payment && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <FileText className="w-4 h-4 text-gray-500" />
              <span>{formatAmount(booking.payment.amount)} total amount</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Quote Amount */}
        {booking.quote_amount && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <Tag className="w-4 h-4 text-gray-500" />
              <span>Quote: {formatAmount(booking.quote_amount)}</span>
            </div>
          </div>
        )}

        {/* Payment Status */}
        {booking.payment && (
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                booking.payment.status
              )}`}
            >
              {getPaymentStatusText(booking.payment.status)}
            </span>
          </div>
        )}

        {/* Worker Information - Show when worker is assigned */}
        {booking.worker_assignment?.worker && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700">
              <User className="w-4 h-4 text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {booking.worker_assignment.worker.name}
                </span>
                <span className="text-xs text-gray-500">
                  {booking.worker_assignment.worker.phone}
                </span>
                {booking.worker_assignment.status && (
                  <span className="text-xs text-blue-600 capitalize">
                    {booking.worker_assignment.status.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-4 mt-4 border-t border-gray-100">
          {canCancel(booking.status) && onCancel && (
            <button
              onClick={() => onCancel(booking)}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              Cancel Booking
            </button>
          )}

          {canAcceptRejectQuote(booking.status) &&
            onAcceptQuote &&
            onRejectQuote && (
              <>
                <button
                  onClick={() => onAcceptQuote(booking)}
                  className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                >
                  Accept Quote
                </button>
                <button
                  onClick={() => onRejectQuote(booking)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  Reject Quote
                </button>
              </>
            )}
        </div>
      )}
    </div>
  );
}
