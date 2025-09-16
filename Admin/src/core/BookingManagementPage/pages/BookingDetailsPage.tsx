"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  FileText,
  UserCheck,
  MessageSquare,
  XCircle,
  Loader,
  DollarSign,
} from "lucide-react";
import {
  getBookingById,
  updateBookingStatus,
  assignWorkerToBooking,
  getPaymentSegments,
} from "@/lib/api-client";
import {
  DetailedBookingResponse,
  getBookingStatusColor,
  getPaymentStatusColor,
  getAssignmentStatusColor,
  getPaymentSegmentStatusColor,
  PaymentStatus,
  AssignmentStatus,
  PaymentProgress,
} from "@/types/booking";
import { Button } from "@/components/Button";
import StatusUpdateModal from "../components/StatusUpdateModal";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Model from "@/components/Model/Base/Model";
import { useAvailableWorkers } from "@/hooks/useAvailableWorkers";
import {
  displayValue,
  displayDate,
  displayTime,
  displayDateTime,
  displayCurrency,
  displayDuration,
} from "@/utils/displayUtils";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = Number(params.id);

  const [booking, setBooking] = useState<DetailedBookingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");

  const [showWorkerAssignmentModal, setShowWorkerAssignmentModal] =
    useState(false);
  const [modalSelectedWorkerId, setModalSelectedWorkerId] =
    useState<string>("");

  // Payment progress state
  const [paymentProgress, setPaymentProgress] =
    useState<PaymentProgress | null>(null);
  const [isLoadingPaymentProgress, setIsLoadingPaymentProgress] =
    useState(false);

  // Get available workers
  const scheduledTime = booking?.scheduled_time || "";
  const serviceDuration = booking?.service?.duration
    ? parseInt(booking.service.duration.split(" ")[0]) * 60 // Convert hours to minutes
    : 120; // Default 2 hours

  const {
    workers,
    loading: workersLoading,
    error: workersError,
  } = useAvailableWorkers({
    scheduledTime,
    serviceDuration,
    serviceId: booking?.service?.id,
    enabled: !!booking,
  });

  const workerOptions = workers.map((worker) => ({
    label: `${worker.name} (${worker.phone})`,
    value: worker.ID.toString(),
  }));

  const loadBookingDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getBookingById(bookingId, true);
      setBooking(response.booking as DetailedBookingResponse);
    } catch {
      setError("Failed to load booking details");
      toast.error("Error loading booking details");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  const loadPaymentProgress = useCallback(async () => {
    if (!bookingId) return;

    try {
      setIsLoadingPaymentProgress(true);
      const response = await getPaymentSegments(bookingId);
      if (response.data) {
        setPaymentProgress(response.data as unknown as PaymentProgress);
      }
    } catch (error) {
      console.error("Failed to load payment progress:", error);
      // Don't show error toast as this is optional information
    } finally {
      setIsLoadingPaymentProgress(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
      loadPaymentProgress();
    }
  }, [bookingId, loadBookingDetails, loadPaymentProgress]);

  const handleStatusUpdate = async (status: string) => {
    try {
      setIsUpdating(true);
      await updateBookingStatus(bookingId, { status });
      toast.success("Booking status updated successfully");
      setShowStatusModal(false);
      loadBookingDetails();
    } catch {
      toast.error("Failed to update booking status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWorkerAssignment = async () => {
    if (!selectedWorkerId) return;

    try {
      setIsAssigning(true);
      await assignWorkerToBooking(bookingId, {
        worker_id: parseInt(selectedWorkerId),
      });
      toast.success("Worker assigned successfully");
      setSelectedWorkerId("");
      loadBookingDetails();
    } catch {
      toast.error("Failed to assign worker");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleModalWorkerAssignment = async () => {
    if (!modalSelectedWorkerId) {
      toast.error("Please select a worker");
      return;
    }

    try {
      setIsAssigning(true);
      await assignWorkerToBooking(bookingId, {
        worker_id: parseInt(modalSelectedWorkerId),
      });
      toast.success("Worker assigned successfully");
      setModalSelectedWorkerId("");
      setShowWorkerAssignmentModal(false);
      loadBookingDetails();
    } catch {
      toast.error("Failed to assign worker");
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    return displayDate(dateString, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string | null) => {
    return displayTime(timeString);
  };

  const formatDateTime = (dateTimeString: string | null) => {
    return displayDateTime(dateTimeString);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Booking
        </h2>
        <p className="text-gray-600 mb-4">{error || "Booking not found"}</p>
        <Button variant="primary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.back()}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Booking #{booking.booking_reference}
              </h1>
              <p className="text-sm text-gray-600">
                Created on {formatDateTime(booking.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-md border ${getBookingStatusColor(
                booking.status
              )}`}
            >
              {booking.status.replace("_", " ").toUpperCase()}
            </span>
            {/* Chat Button */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageSquare className="w-4 h-4" />}
              onClick={() => {
                // TODO: Open chat modal for this booking
                toast.info("Chat feature coming soon!");
              }}
            >
              Chat
            </Button>
          </div>
        </div>
      </div>

      <div className=" py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Scheduled Date</p>
                    <p className="font-medium">
                      {formatDate(booking.scheduled_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Scheduled Time</p>
                    <p className="font-medium">
                      {formatTime(booking.scheduled_time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Booking Type</p>
                    <p className="font-medium capitalize">
                      {booking.booking_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Completion Type</p>
                    <p className="font-medium">
                      {booking.status === "completed"
                        ? "Completed"
                        : displayValue(
                            booking.completion_type,
                            "Not completed"
                          )}
                    </p>
                  </div>
                </div>
                {paymentProgress && paymentProgress.total_segments > 1 && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Payment Segments</p>
                      <p className="font-medium">
                        {paymentProgress.paid_segments}/
                        {paymentProgress.total_segments} paid
                        <span className="ml-2 text-xs text-gray-500">
                          ({paymentProgress.progress_percentage.toFixed(0)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Segments - Clean and minimal */}
            {paymentProgress && paymentProgress.total_segments > 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Segments
                </h2>
                {isLoadingPaymentProgress ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">
                      Loading...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Progress Overview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {paymentProgress.paid_segments}/
                          {paymentProgress.total_segments}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${paymentProgress.progress_percentage}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {paymentProgress.paid_segments ===
                          paymentProgress.total_segments
                            ? "Complete"
                            : paymentProgress.segments?.some(
                                (s) => s.is_overdue && s.status === "pending"
                              )
                            ? "Overdue"
                            : "In Progress"}
                        </span>
                        <span>
                          {paymentProgress.progress_percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Individual Segments */}
                    {paymentProgress.segments &&
                      paymentProgress.segments.length > 0 && (
                        <div className="space-y-2">
                          <div className="border-t border-gray-100 pt-3">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                              Segments
                            </h3>
                            <div className="space-y-2">
                              {paymentProgress.segments.map(
                                (segment, index) => (
                                  <div
                                    key={segment.id || index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200">
                                        <span className="text-xs font-medium text-gray-600">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {displayCurrency(segment.amount)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Due: {displayDate(segment.due_date)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span
                                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-md ${getPaymentSegmentStatusColor(
                                          segment.status,
                                          segment.is_overdue
                                        )}`}
                                      >
                                        {segment.status === "paid"
                                          ? "PAID"
                                          : segment.is_overdue
                                          ? "OVERDUE"
                                          : "PENDING"}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            {/* Service Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Service Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {booking.service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {booking.service.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Price Type</p>
                    <p className="font-medium capitalize">
                      {booking.service.price_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-medium">
                      {booking.service.price
                        ? displayCurrency(booking.service.price)
                        : displayValue(booking.service.price, "Price not set")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">
                      {displayDuration(booking.service.duration)}
                    </p>
                  </div>
                </div>
                {booking.service.category && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {booking.service.category.name}
                    </span>
                    {booking.service.subcategory && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {booking.service.subcategory.name}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Address Information
              </h2>
              {booking.address ? (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium">
                      {displayValue(booking.address.name, "Service Address")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {displayValue(
                        booking.address.address,
                        "Address not provided"
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {displayValue(booking.address.city, "City not provided")},{" "}
                      {displayValue(
                        booking.address.state,
                        "State not provided"
                      )}{" "}
                      {displayValue(
                        booking.address.postal_code,
                        "Postal code not provided"
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Landmark:{" "}
                      {displayValue(
                        booking.address.landmark,
                        "No landmark specified"
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      No address information provided
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information - Only show for inquiry bookings */}
            {booking.booking_type === "inquiry" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Contact Person</p>
                      <p className="font-medium">
                        {displayValue(booking.contact.person, "Not provided")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Contact Phone</p>
                      <p className="font-medium">
                        {displayValue(booking.contact.phone, "Not provided")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-sm">
                      {displayValue(
                        booking.contact.description,
                        "No description provided"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Special Instructions
                    </p>
                    <p className="text-sm">
                      {displayValue(
                        booking.contact.special_instructions,
                        "No special instructions"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {displayValue(booking.user.name, "Name not provided")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{booking.user.phone}</p>
                </div>
                {booking.user.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{booking.user.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">User Type</p>
                  <p className="font-medium capitalize">
                    {booking.user.user_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wallet Balance</p>
                  <p className="font-medium">₹{booking.user.wallet_balance}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {booking.payment && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-md border ${getPaymentStatusColor(
                        booking.payment.status as PaymentStatus
                      )}`}
                    >
                      {booking.payment.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-medium">
                      {displayCurrency(
                        booking.payment.amount,
                        booking.payment.currency
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="font-medium">
                      {displayValue(booking.payment.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">
                      {displayValue(booking.payment.payment_method)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p className="font-medium">
                      {formatDateTime(booking.payment.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Worker Assignment - Only show if booking is not completed */}
            {booking.status !== "completed" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Worker Assignment
                </h2>
                {booking.worker_assignment ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-md border ${getAssignmentStatusColor(
                          (booking.worker_assignment.status ||
                            "") as AssignmentStatus
                        )}`}
                      >
                        {(
                          booking.worker_assignment.status || "UNASSIGNED"
                        ).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Assigned Worker</p>
                      <p className="font-medium">
                        {booking.worker_assignment.worker
                          ? displayValue(
                              booking.worker_assignment.worker.name,
                              "Worker name not provided"
                            )
                          : displayValue(null, "No worker assigned")}
                      </p>
                      {booking.worker_assignment.worker && (
                        <p className="text-sm text-gray-600">
                          {displayValue(
                            booking.worker_assignment.worker.phone,
                            "Phone not provided"
                          )}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Assigned At</p>
                      <p className="font-medium">
                        {displayDateTime(booking.worker_assignment.assigned_at)}
                      </p>
                    </div>
                    {booking.worker_assignment.accepted_at && (
                      <div>
                        <p className="text-sm text-gray-600">Accepted At</p>
                        <p className="font-medium">
                          {displayDateTime(
                            booking.worker_assignment.accepted_at
                          )}
                        </p>
                      </div>
                    )}
                    {booking.worker_assignment.acceptance_notes && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Acceptance Notes
                        </p>
                        <p className="font-medium">
                          {booking.worker_assignment.acceptance_notes}
                        </p>
                      </div>
                    )}
                    {booking.worker_assignment.rejected_at && (
                      <div>
                        <p className="text-sm text-gray-600">Rejected At</p>
                        <p className="font-medium">
                          {displayDateTime(
                            booking.worker_assignment.rejected_at
                          )}
                        </p>
                      </div>
                    )}
                    {booking.worker_assignment.rejection_reason && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Rejection Reason
                        </p>
                        <p className="font-medium text-red-600">
                          {booking.worker_assignment.rejection_reason}
                        </p>
                      </div>
                    )}
                    {booking.worker_assignment.rejection_notes && (
                      <div>
                        <p className="text-sm text-gray-600">Rejection Notes</p>
                        <p className="font-medium">
                          {booking.worker_assignment.rejection_notes}
                        </p>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      {/* Show reassign button if worker hasn't accepted, is in progress, or completed */}
                      {booking.worker_assignment.status !== "accepted" &&
                        booking.worker_assignment.status !== "in_progress" &&
                        booking.worker_assignment.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowWorkerAssignmentModal(true)}
                            disabled={isAssigning}
                          >
                            {isAssigning ? "Assigning..." : "Reassign"}
                          </Button>
                        )}

                      {/* Show status messages */}
                      {booking.worker_assignment.status === "accepted" && (
                        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                          Worker has accepted the assignment
                        </div>
                      )}
                      {booking.worker_assignment.status === "in_progress" && (
                        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                          Service is in progress
                        </div>
                      )}
                      {booking.worker_assignment.status === "completed" && (
                        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                          Service completed
                        </div>
                      )}
                      {booking.worker_assignment.status === "rejected" && (
                        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                          Worker rejected assignment - can reassign
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">No worker assigned</p>

                    {/* Worker Selection Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Worker
                      </label>
                      {workersLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-600">
                            Loading workers...
                          </span>
                        </div>
                      ) : workersError ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-800 text-sm">{workersError}</p>
                        </div>
                      ) : workers.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-yellow-800 text-sm">
                            No workers available
                          </p>
                        </div>
                      ) : (
                        <SearchableDropdown
                          options={workerOptions}
                          value={selectedWorkerId}
                          onChange={(value) =>
                            setSelectedWorkerId(value.toString())
                          }
                          placeholder="Select a worker..."
                          className="w-full"
                        />
                      )}
                    </div>

                    {/* Assign Button */}
                    {selectedWorkerId && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleWorkerAssignment}
                        disabled={isAssigning}
                        loading={isAssigning}
                      >
                        {isAssigning ? "Assigning..." : "Assign Worker"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setShowStatusModal(true)}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Status"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={loadBookingDetails}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onUpdate={handleStatusUpdate}
        isUpdating={isUpdating}
      />

      {/* Worker Assignment Modal */}
      <Model
        isOpen={showWorkerAssignmentModal}
        onClose={() => {
          setShowWorkerAssignmentModal(false);
          setModalSelectedWorkerId("");
        }}
        title="Assign Worker"
        size="md"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowWorkerAssignmentModal(false);
                setModalSelectedWorkerId("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleModalWorkerAssignment}
              disabled={isAssigning || !modalSelectedWorkerId}
              loading={isAssigning}
              className="flex-1"
            >
              {isAssigning ? "Assigning..." : "Assign Worker"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Worker
            </label>
            {workersLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">
                  Loading workers...
                </span>
              </div>
            ) : workersError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{workersError}</p>
              </div>
            ) : workers.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">No workers available</p>
              </div>
            ) : (
              <SearchableDropdown
                options={workerOptions}
                value={modalSelectedWorkerId}
                onChange={(value) => setModalSelectedWorkerId(value.toString())}
                placeholder="Select a worker..."
                className="w-full"
              />
            )}
          </div>

          {booking.worker_assignment && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-2">Current Assignment:</p>
              <p className="text-sm font-medium">
                {booking.worker_assignment.worker?.name || "No worker assigned"}
              </p>
              <p className="text-xs text-gray-500">
                Status: {booking.worker_assignment.status}
              </p>
            </div>
          )}
        </div>
      </Model>
    </div>
  );
}
