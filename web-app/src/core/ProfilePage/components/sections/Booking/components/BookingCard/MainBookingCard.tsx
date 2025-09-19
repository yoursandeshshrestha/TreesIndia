"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Phone,
  Loader2,
  User,
  Navigation,
  CreditCard,
  MessageCircle,
  FileText,
} from "lucide-react";
import type { Booking as ApiBooking } from "@/lib/bookingApi";
import type { Booking as TypeBooking } from "@/types/booking";
import type { WorkerAssignment } from "@/lib/workerAssignmentApi";
import type { PaymentProgress, PaymentSegmentInfo } from "@/types/booking";
import { LocationTrackingModal } from "../LocationTrackingModal/LocationTrackingModal";
import { PaymentSegmentsModal } from "@/core/ProfilePage/components/sections/Booking/components/PaymentSegment";
import { useAppDispatch } from "@/store/hooks";
import { openChatModalWithUser } from "@/store/slices/chatModalSlice";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface MainBookingCardProps {
  booking: ApiBooking;
  onCancel?: (booking: ApiBooking) => void;
  onAcceptQuote?: (booking: ApiBooking) => void;
  onRejectQuote?: (booking: ApiBooking) => void;
  onPayNow?: (booking: ApiBooking) => void;
  onPayNextSegment?: (booking: ApiBooking) => void;
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
  onPayNextSegment,
  showActions = true,
  isAcceptingQuote = false,
  isPaying = false,
}: MainBookingCardProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSegmentsModalOpen, setIsSegmentsModalOpen] = useState(false);

  // Redux and auth hooks
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // Get payment segments directly from booking object (new structure)
  const paymentSegments = booking.payment_segments || [];

  // Calculate payment progress from segments
  const calculatePaymentProgress = (
    segments: PaymentSegmentInfo[]
  ): PaymentProgress | null => {
    if (!segments || segments.length === 0) return null;

    const totalAmount = segments.reduce(
      (sum, segment) => sum + segment.amount,
      0
    );
    const paidSegments = segments.filter(
      (segment) => segment.status === "paid"
    );
    const paidAmount = paidSegments.reduce(
      (sum, segment) => sum + segment.amount,
      0
    );
    const remainingAmount = totalAmount - paidAmount;
    const progressPercentage =
      totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    return {
      total_amount: totalAmount,
      paid_amount: paidAmount,
      remaining_amount: remainingAmount,
      total_segments: segments.length,
      paid_segments: paidSegments.length,
      remaining_segments: segments.length - paidSegments.length,
      progress_percentage: progressPercentage,
      segments: segments,
    };
  };

  const paymentProgress = calculatePaymentProgress(paymentSegments);

  // Check if this booking has payment segments
  const hasPaymentSegments = paymentSegments.length > 0;

  // Check if there are pending segments to pay
  const hasPendingSegments = paymentSegments.some(
    (segment: PaymentSegmentInfo) =>
      segment.status === "pending" || segment.status === "overdue"
  );

  // Check if this is a single segment (should show "Pay Now" and open quote acceptance modal)
  const isSingleSegment = paymentSegments.length === 1;

  // Check if this is the first segment of multiple segments (no segments paid yet) and quote is accepted
  const isFirstSegment =
    paymentProgress &&
    paymentProgress.paid_segments === 0 &&
    hasPendingSegments &&
    booking.status === "quote_accepted" &&
    !isSingleSegment;

  // Check if this is a next segment (some segments already paid) and booking is in progress
  const isNextSegment =
    paymentProgress &&
    paymentProgress.paid_segments > 0 &&
    hasPendingSegments &&
    (booking.status === "quote_accepted" ||
      booking.status === "partially_paid" ||
      booking.status === "confirmed");

  const getStatusConfig = (
    status: string,
    paymentStatus?: string,
    booking?: ApiBooking
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
        return {
          icon: (
            <Image
              src="/icons/worker.png"
              alt="Service Scheduled"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          ),
          text: "Service Scheduled",
          subtitle: "Your service is scheduled and ready",
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

  const formatAddress = (address?: {
    name: string;
    address: string;
    city: string;
  }) => {
    if (!address) return "Address not available";
    const addressName = address.name || "Home";
    const addressText = `${address.address}, ${address.city}`;
    return `${addressName} • ${addressText}`;
  };

  const formatContact = (contact?: {
    person: string;
    description: string;
    special_instructions: string;
  }) => {
    if (!contact?.person) return "Contact information not available";
    return contact.person;
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const statusConfig = getStatusConfig(
    booking.status,
    booking.payment_status,
    booking
  );

  // Convert ApiBooking to TypeBooking for PaymentSegmentsModal
  const convertToTypeBooking = (apiBooking: ApiBooking): TypeBooking => ({
    id: apiBooking.ID,
    ID: apiBooking.ID,
    booking_reference: apiBooking.booking_reference,
    status: apiBooking.status,
    payment_status: apiBooking.payment_status || "",
    booking_type: apiBooking.booking_type || "",
    scheduled_date: apiBooking.scheduled_date || "",
    scheduled_time: apiBooking.scheduled_time || "",
    total_amount: apiBooking.quote_amount || undefined,
    address: apiBooking.address ? JSON.stringify(apiBooking.address) : "",
    description: apiBooking.contact?.description || "",
    CreatedAt: apiBooking.created_at || "",
    UpdatedAt: apiBooking.updated_at || "",
    quote_amount: apiBooking.quote_amount || undefined,
    quote_notes: apiBooking.quote_notes || undefined,
    quote_provided_at: apiBooking.quote_provided_at || undefined,
    quote_accepted_at: apiBooking.quote_accepted_at || undefined,
    quote_expires_at: apiBooking.quote_expires_at || undefined,
    payment_segments: apiBooking.payment_segments || undefined,
    payment_progress: paymentProgress || undefined,
    contact_person: apiBooking.contact?.person || undefined,
    contact_phone: apiBooking.contact?.person || undefined,
    service: apiBooking.service
      ? {
          id: apiBooking.service.ID,
          name: apiBooking.service.name,
          price_type: apiBooking.service.price_type,
          price: apiBooking.service.price || undefined,
          duration: apiBooking.service.duration || undefined,
        }
      : undefined,
    user: apiBooking.user
      ? {
          id: apiBooking.user.ID,
          ID: apiBooking.user.ID,
          name: apiBooking.user.name,
          phone: "",
          user_type: apiBooking.user.user_type,
        }
      : undefined,
  });

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

          {/* Scheduled Date & Time - Only show if scheduled or single payment */}
          {booking.scheduled_date ||
          !(booking.payment_segments && booking.payment_segments.length > 1) ? (
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
          ) : null}

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
            {booking.quote_duration && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Service Duration: {booking.quote_duration}</span>
              </div>
            )}
            {booking.quote_notes && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="flex-1">
                  <span className="font-medium">Quote Notes:</span>{" "}
                  {booking.quote_notes}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="truncate max-w-[400px]">
                {formatAddress(booking.address)}
              </span>
            </div>
            {booking.contact?.person && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{formatContact(booking.contact)}</span>
              </div>
            )}
            {booking.worker_assignment?.worker &&
              !["rejected"].includes(
                booking.worker_assignment.status || ""
              ) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>
                    Worker: {booking.worker_assignment.worker.name}{" "}
                    {booking.worker_assignment.worker.phone || ""}
                  </span>
                  {booking.worker_assignment.status &&
                    ["accepted", "in_progress"].includes(
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
            {booking.payment && !hasPaymentSegments && (
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

              {/* Pay Now Button - Show for single segment or no segments */}
              {booking.status === "quote_accepted" &&
                (isSingleSegment || !hasPaymentSegments) &&
                onPayNow && (
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

              {/* Pay First Segment Button - Show if this is the first segment of multiple segments */}
              {isFirstSegment && onPayNextSegment && (
                <button
                  onClick={() => onPayNextSegment(booking)}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Pay First Segment</span>
                  </div>
                </button>
              )}

              {/* Pay Next Segment Button - Show if this is a next segment */}
              {isNextSegment && onPayNextSegment && (
                <button
                  onClick={() => onPayNextSegment(booking)}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Next Segment</span>
                  </div>
                </button>
              )}

              {/* View Segments Button - Show if booking has payment segments */}
              {hasPaymentSegments &&
                (booking.status === "quote_provided" ||
                  booking.status === "quote_accepted" ||
                  booking.status === "partially_paid" ||
                  booking.status === "confirmed") && (
                  <button
                    onClick={() => setIsSegmentsModalOpen(true)}
                    className="w-full px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>View Segments</span>
                    </div>
                  </button>
                )}

              {[
                "pending",
                "confirmed",
                "scheduled",
                "quote_provided",
                "quote_accepted",
              ].includes(booking.status) &&
                onCancel &&
                // Don't show cancel button if worker has accepted the assignment
                !["accepted", "in_progress"].includes(
                  booking.worker_assignment?.status || ""
                ) && (
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

              {/* Communication Icons - Bottom of Right Side */}
              {booking.worker_assignment?.worker &&
                ["accepted", "in_progress"].includes(
                  booking.worker_assignment.status
                ) && (
                  <div className="mt-auto pt-4 border-t border-gray-200">
                    <div className="text-center text-xs text-gray-500 mb-2">
                      Quick Actions
                    </div>
                    <div className="flex gap-6 justify-center">
                      <button
                        onClick={() => {
                          // TODO: Implement phone call functionality
                          console.log(
                            "Phone call clicked for worker:",
                            booking.worker_assignment?.worker?.name
                          );
                        }}
                        className="p-2 text-gray-800 hover:text-gray-600 transition-colors"
                        title="Call Worker"
                      >
                        <Phone className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => {
                          if (
                            booking.worker_assignment?.worker?.ID &&
                            user?.id
                          ) {
                            dispatch(
                              openChatModalWithUser({
                                user_1: user.id,
                                user_2: booking.worker_assignment.worker.ID,
                              })
                            );
                          } else {
                            toast.error(
                              "Unable to start chat - missing user information"
                            );
                          }
                        }}
                        className="p-2 text-gray-800 hover:text-gray-600 transition-colors"
                        title="Chat with Worker"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Location Tracking Modal */}
      {booking.worker_assignment?.status === "in_progress" &&
        booking.worker_assignment?.worker_id && (
          <LocationTrackingModal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            assignment={booking.worker_assignment as WorkerAssignment}
            booking={booking?.ID ? { ...booking, ID: booking.ID } : undefined}
          />
        )}

      {/* Payment Segments Modal */}
      <PaymentSegmentsModal
        isOpen={isSegmentsModalOpen}
        onClose={() => setIsSegmentsModalOpen(false)}
        booking={convertToTypeBooking(booking)}
        paymentProgress={paymentProgress}
      />
    </div>
  );
}
