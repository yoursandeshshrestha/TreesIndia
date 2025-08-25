"use client";

import React, { useState, useEffect } from "react";
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
  CreditCard,
  UserCheck,
  MessageSquare,
  Activity,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import {
  getBookingById,
  updateBookingStatus,
  assignWorkerToBooking,
} from "@/lib/api-client";
import {
  DetailedBookingResponse,
  getBookingStatusColor,
  getPaymentStatusColor,
  getAssignmentStatusColor,
} from "@/types/booking";
import Button from "@/components/Button";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import StatusUpdateModal from "../components/StatusUpdateModal";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import { useAvailableWorkers } from "@/hooks/useAvailableWorkers";
import {
  displayValue,
  displayDate,
  displayTime,
  displayDateTime,
  displayCurrency,
  displayDuration,
  displayStatus,
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
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [showAssignConfirmation, setShowAssignConfirmation] = useState(false);

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

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getBookingById(bookingId, true);
      setBooking(response.booking as DetailedBookingResponse);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load booking details"
      );
      toast.error("Error loading booking details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      setIsUpdating(true);
      await updateBookingStatus(bookingId, { status });
      toast.success("Booking status updated successfully");
      setShowStatusModal(false);
      loadBookingDetails();
    } catch (err) {
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
      setShowAssignConfirmation(false);
      loadBookingDetails();
    } catch (err) {
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
                      {displayValue(booking.completion_type, "Not completed")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

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

            {/* Contact Information */}
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
                        booking.payment.status as any
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

            {/* Worker Assignment */}
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
                        (booking.worker_assignment.status || "") as any
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
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAssignConfirmation(true)}
                      disabled={isAssigning}
                    >
                      {isAssigning ? "Assigning..." : "Reassign"}
                    </Button>
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

      {/* Assign Worker Confirmation Modal */}
      <ConfirmModal
        isOpen={showAssignConfirmation}
        onClose={() => setShowAssignConfirmation(false)}
        onConfirm={handleWorkerAssignment}
        title="Confirm Worker Assignment"
        message="Are you sure you want to assign the selected worker to this booking?"
        confirmText="Assign"
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
}
