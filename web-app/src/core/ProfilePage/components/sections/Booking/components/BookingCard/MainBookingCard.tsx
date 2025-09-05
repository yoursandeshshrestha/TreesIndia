"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Clock, MapPin, Phone, Loader2, User, Navigation } from "lucide-react";
import type { Booking } from "@/lib/bookingApi";
import type { WorkerAssignment } from "@/lib/workerAssignmentApi";
import { LocationTrackingModal } from "../LocationTrackingModal/LocationTrackingModal";

interface MainBookingCardProps {
  booking: Booking;
  onCancel?: (booking: Booking) => void;
  onAcceptQuote?: (booking: Booking) => void;
  onRejectQuote?: (booking: Booking) => void;
  onPayNow?: (booking: Booking) => void;
  showActions?: boolean;
  isAcceptingQuote?: boolean;
  isPaying?: boolean;
}

export function MainBookingCard({
  booking,
  onCancel,
  onAcceptQuote,
  onRejectQuote,
  onPayNow,
  showActions = true,
  isAcceptingQuote = false,
  isPaying = false,
}: MainBookingCardProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const getStatusConfig = (
    status: string,
    paymentStatus?: string,
    booking?: Booking
  ) => {
    // Special case: pending status with completed payment
    if (status === "pending" && paymentStatus === "completed") {
      return {
        icon: (
          <Image
            src="/icons/booking.png"
            alt="Quote Request"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        ),
        text: "Quote Request Submitted",
        subtitle:
          "Our team will review your request and provide a quote shortly",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    }

    switch (status) {
      case "completed":
        return {
          icon: (
            <Image
              src="/icons/completed.png"
              alt="Completed"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          ),
          text: "Service completed successfully",
          subtitle: "Service has been completed successfully",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
      case "confirmed":
      case "scheduled":
        const workerRejected =
          booking?.worker_assignment?.status === "rejected";
        const hasWorkerAssignment = booking?.worker_assignment?.worker?.name;

        // If there's a worker assignment, show worker assigned status
        if (
          hasWorkerAssignment &&
          booking?.worker_assignment?.status === "accepted"
        ) {
          const workerName =
            booking?.worker_assignment?.worker?.name || "Worker";
          return {
            icon: (
              <Image
                src="/icons/worker.png"
                alt="Worker Assigned"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            ),
            text: `Worker assigned - ${workerName}`,
            subtitle: "Your service professional is on the way",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          };
        }

        return {
          icon: (
            <Image
              src="/icons/clock.png"
              alt="Scheduled"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          ),
          text: booking?.service?.name || "Service",
          subtitle: workerRejected
            ? "A new professional will be assigned to this booking soon"
            : "A professional will be assigned to this booking soon",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "assigned":
        const workerName = booking?.worker_assignment?.worker?.name;
        return {
          icon: (
            <Image
              src="/icons/worker.png"
              alt="Worker Assigned"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          ),
          text: workerName
            ? `Worker assigned - ${workerName}`
            : "Worker assigned",
          subtitle: "Your service professional is on the way",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "in_progress":
        const inProgressWorkerName = booking?.worker_assignment?.worker?.name;
        const hasStarted = booking?.actual_start_time;
        return {
          icon: (
            <Image
              src="/icons/work_in_progress.png"
              alt="Service In Progress"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          ),
          text: hasStarted
            ? inProgressWorkerName
              ? `Service in progress - ${inProgressWorkerName}`
              : "Service in progress"
            : inProgressWorkerName
            ? `${inProgressWorkerName} is on site`
            : "Service starting",
          subtitle: hasStarted
            ? "Your service is currently being performed"
            : "Your service professional has arrived and is ready to start",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
      case "quote_accepted":
        return {
          icon: (
            <Image
              src="/icons/quote_accepted.png"
              alt="Quote Accepted"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          ),
          text: "Quote Accepted",
          subtitle: "Please complete the payment to proceed with the booking",
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "pending":
      case "quote_provided":
        return {
          icon: (
            <Image
              src="/icons/alert.png"
              alt="Quote Provided"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          ),
          text: "Quote provided",
          subtitle: "Please review and accept the quote",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case "temporary_hold":
        return {
          icon: (
            <Image
              src="/icons/clock.png"
              alt="Temporary Hold"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          ),
          text: "Payment Verification",
          subtitle:
            "Your payment is being verified. This may take a few minutes.",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
        };
      case "cancelled":
      case "rejected":
        return {
          icon: (
            <Image
              src="/icons/rejected.png"
              alt="Cancelled"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          ),
          text: "Booking cancelled",
          subtitle: "This booking has been cancelled",
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      default:
        return {
          icon: (
            <Image
              src="/icons/booking.png"
              alt="Booking Status"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          ),
          text: "Booking status",
          subtitle: "Your booking is being processed",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  };

  const formatDate = (
    dateString?: string | null,
    timeString?: string | null
  ) => {
    if (!dateString) return "To be scheduled after quote acceptance";

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
    } catch {
      return "Invalid date";
    }
  };

  const formatTimeOnly = (timeString?: string | null) => {
    if (!timeString) return null;

    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return null;
    }
  };

  const formatAddress = (addressString: string) => {
    try {
      const address = JSON.parse(addressString);
      const addressName = address.name || "Home";
      const addressText = `${address.address}, ${address.city}`;
      return `${addressName} • ${addressText}`;
    } catch {
      return "Address not available";
    }
  };

  const formatContact = (contactPerson: string, contactPhone: string) => {
    if (!contactPerson && !contactPhone)
      return "Contact information not available";

    if (contactPerson && contactPhone) {
      return `${contactPerson} • ${contactPhone}`;
    } else if (contactPerson) {
      return contactPerson;
    } else if (contactPhone) {
      return contactPhone;
    }

    return "Contact information not available";
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const statusConfig = getStatusConfig(
    booking.status,
    booking.payment_status,
    booking
  );

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden">
      <div className="flex">
        {/* Left Side - Status and Service Info */}
        <div className="flex-1 p-6">
          {/* Status Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 mt-1 flex items-center justify-center ">
              {statusConfig.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-xl mb-1">
                {booking.service?.name || "Service"}
              </h3>
              <p className="text-sm text-gray-500 font-medium mb-3">
                {statusConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Scheduled Date & Time - Prominent Display */}
          <div className="rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Service Date
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(booking.scheduled_date, booking.scheduled_time)}
                </div>
              </div>
            </div>
          </div>

          {/* Key Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Booking ID:
              </span>
              <span className="text-sm font-mono font-semibold text-gray-800">
                {booking.booking_reference}
              </span>
            </div>

            {booking.actual_start_time && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>
                  Started at: {formatTimeOnly(booking.actual_start_time)}
                </span>
              </div>
            )}
            {booking.actual_end_time && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>
                  Completed at: {formatTimeOnly(booking.actual_end_time)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="truncate max-w-[400px]">
                {formatAddress(booking.address)}
              </span>
            </div>
            {(booking.contact_person || booking.contact_phone) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>
                  {formatContact(booking.contact_person, booking.contact_phone)}
                </span>
              </div>
            )}
            {booking.worker_assignment?.worker &&
              !["rejected"].includes(
                booking.worker_assignment.status || ""
              ) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>
                    Worker: {booking.worker_assignment.worker.name} (
                    {booking.worker_assignment.worker.phone})
                  </span>
                  {booking.worker_assignment.status &&
                    ["assigned", "accepted", "in_progress"].includes(
                      booking.worker_assignment.status
                    ) && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {booking.worker_assignment.status.replace("_", " ")}
                      </span>
                    )}
                </div>
              )}
          </div>
        </div>

        {/* Right Side - Payment and Actions */}
        <div className="w-64 border-l border-gray-200 p-6">
          {/* Payment Info */}
          <div className="mb-4">
            {booking.payment && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatAmount(booking.payment.amount)}
                </span>
              </div>
            )}
            {booking.quote_amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quote Amount</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatAmount(booking.quote_amount)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="space-y-2">
              {booking.status === "quote_provided" &&
                onAcceptQuote &&
                onRejectQuote && (
                  <>
                    <button
                      onClick={() => onAcceptQuote(booking)}
                      disabled={isAcceptingQuote}
                      className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAcceptingQuote ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Accepting...</span>
                        </div>
                      ) : (
                        "Accept Quote"
                      )}
                    </button>
                    <button
                      onClick={() => onRejectQuote(booking)}
                      disabled={isAcceptingQuote}
                      className="w-full px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject Quote
                    </button>
                  </>
                )}

              {booking.status === "quote_accepted" && onPayNow && (
                <button
                  onClick={() => onPayNow(booking)}
                  disabled={isPaying}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaying ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Pay Now"
                  )}
                </button>
              )}

              {[
                "pending",
                "confirmed",
                "scheduled",
                "quote_provided",
                "quote_accepted",
              ].includes(booking.status) &&
                onCancel && (
                  <button
                    onClick={() => onCancel(booking)}
                    className="w-full px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}

              {booking.status === "temporary_hold" && (
                <div className="text-center">
                  <div className="text-sm text-orange-600 mb-2">
                    Payment verification in progress...
                  </div>
                  <div className="text-xs text-gray-500">
                    This may take a few minutes
                  </div>
                </div>
              )}

              {["cancelled", "rejected"].includes(booking.status) && (
                <div className="text-center">
                  <div className="text-sm text-red-600 mb-2">
                    {booking.status === "cancelled"
                      ? "Booking Cancelled"
                      : "Quote Rejected"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {booking.status === "cancelled"
                      ? "This booking has been cancelled"
                      : "The quote has been rejected"}
                  </div>
                </div>
              )}

              {/* Location Tracking Button - Show for in_progress bookings */}
              {booking.worker_assignment?.status === "in_progress" && (
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Track Worker Location
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location Tracking Modal */}
      {booking.worker_assignment?.status === "in_progress" &&
        booking.worker_assignment?.ID && (
          <LocationTrackingModal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            assignment={booking.worker_assignment as WorkerAssignment}
            booking={booking}
          />
        )}
    </div>
  );
}
