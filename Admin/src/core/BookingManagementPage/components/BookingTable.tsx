"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Calendar,
  Clock,
  Phone,
  Check,
  X,
  MessageSquare,
  DollarSign,
  IndianRupee,
} from "lucide-react";
import {
  OptimizedBookingResponse,
  getBookingStatusColor,
} from "@/types/booking";
import Button from "@/components/Button/Base/Button";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import { useAvailableWorkers } from "@/hooks/useAvailableWorkers";
import Table from "@/components/Table/Table";
import DualStatusBadge from "@/components/DualStatusBadge";
import {
  displayValue,
  displayDate,
  displayTime,
  displayCurrency,
  displayDuration,
} from "@/utils/displayUtils";

interface BookingTableProps {
  bookings: OptimizedBookingResponse[];
  onWorkerAssignment: (bookingId: number, workerId: number) => Promise<void>;
  isAssigning: boolean;
  onProvideQuote?: (booking: OptimizedBookingResponse) => void;
  onChat?: (booking: OptimizedBookingResponse) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onWorkerAssignment,
  isAssigning,
  onProvideQuote,
  onChat,
}) => {
  const router = useRouter();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );

  const {
    workers,
    loading: workersLoading,
    error: workersError,
  } = useAvailableWorkers({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  const getBookingTypeColor = (type: string) => {
    return type === "regular"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-purple-100 text-purple-800 border-purple-200";
  };

  const handleViewDetails = (booking: OptimizedBookingResponse) => {
    router.push(`/dashboard/bookings/${booking.id}`);
  };

  const handleAssignWorker = async () => {
    if (!selectedWorkerId || !selectedBookingId) return;

    try {
      await onWorkerAssignment(selectedBookingId, parseInt(selectedWorkerId));
      setSelectedWorkerId("");
      setSelectedBookingId(null);
      toast.success("Worker assigned successfully");
    } catch (error) {
      toast.error("Failed to assign worker");
    }
  };

  const handleCancelAssignment = () => {
    setSelectedWorkerId("");
    setSelectedBookingId(null);
  };

  const workerOptions = workers.map((worker) => ({
    value: worker.ID.toString(),
    label: `${worker.name} (${worker.phone})`,
  }));

  const columns = [
    {
      header: "Booking Ref",
      accessor: (booking: OptimizedBookingResponse) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {booking.booking_reference}
          </div>
          <div className="text-xs text-gray-400">
            {formatDate(booking.created_at)}
          </div>
        </div>
      ),
    },
    {
      header: "Service",
      accessor: (booking: OptimizedBookingResponse) => (
        <div>
          <div className="text-sm text-gray-900">{booking.service.name}</div>
          <div className="flex items-center gap-2">
            {booking.service.price ? (
              <div className="text-sm text-gray-500">
                {displayCurrency(booking.service.price)}
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                {displayValue(booking.service.price, "Price not set")}
              </div>
            )}
            {booking.service.duration ? (
              <div className="text-xs text-gray-400">
                {displayDuration(booking.service.duration)}
              </div>
            ) : (
              <div className="text-xs text-gray-400">
                {displayValue(booking.service.duration, "Duration not set")}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Schedule",
      accessor: (booking: OptimizedBookingResponse) => (
        <div>
          {booking.scheduled_time ? (
            <div className="flex flex-col">
              <div className="text-sm text-gray-900 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {displayDate(booking.scheduled_time)}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {displayTime(booking.scheduled_time)}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">
              {displayValue(booking.scheduled_time, "Not scheduled")}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Booking Status",
      accessor: (booking: OptimizedBookingResponse) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getBookingStatusColor(
            booking.status
          )}`}
        >
          {booking.status.replace("_", " ").toUpperCase()}
        </span>
      ),
    },
    {
      header: "Payment Status",
      accessor: (booking: OptimizedBookingResponse) => {
        const getPaymentStatusColor = (status: string) => {
          if (!status) {
            return "bg-gray-100 text-gray-800 border-gray-300";
          }

          switch (status) {
            case "completed":
              return "bg-green-100 text-green-800 border-green-300";
            case "pending":
              return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "failed":
              return "bg-red-100 text-red-800 border-red-300";
            case "refunded":
              return "bg-orange-100 text-orange-800 border-orange-300";
            case "abandoned":
              return "bg-gray-100 text-gray-800 border-gray-300";
            case "expired":
              return "bg-red-100 text-red-800 border-red-300";
            case "hold":
              return "bg-blue-100 text-blue-800 border-blue-300";
            default:
              return "bg-gray-100 text-gray-800 border-gray-300";
          }
        };

        const getPaymentStatusLabel = (status: string) => {
          if (!status) {
            return "Not Provided";
          }

          switch (status) {
            case "pending":
              return "Pending";
            case "completed":
              return "Completed";
            case "failed":
              return "Failed";
            case "refunded":
              return "Refunded";
            case "abandoned":
              return "Abandoned";
            case "expired":
              return "Expired";
            case "hold":
              return "On Hold";
            default:
              return status.replace("_", " ").toUpperCase();
          }
        };

        return (
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPaymentStatusColor(
                booking.payment?.status || booking.payment_status
              )}`}
            >
              <IndianRupee className="w-3 h-3 mr-1" />
              {getPaymentStatusLabel(
                booking.payment?.status || booking.payment_status
              )}
            </span>
            {booking.payment && (
              <div className="text-xs text-gray-500">
                {displayCurrency(
                  booking.payment.amount,
                  booking.payment.currency
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Type",
      accessor: (booking: OptimizedBookingResponse) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getBookingTypeColor(
            booking.booking_type
          )}`}
        >
          {booking.booking_type === "regular" ? "Regular" : "Inquiry"}
        </span>
      ),
    },
    {
      header: "Worker",
      accessor: (booking: OptimizedBookingResponse) => {
        // Check if worker assignment is allowed
        const canAssignWorker =
          booking.booking_type === "regular" ||
          (booking.booking_type === "inquiry" &&
            booking.status === "confirmed");

        return (
          <div>
            {selectedBookingId === booking.id ? (
              <div className="space-y-2">
                <div>
                  {workersLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      <span className="ml-2 text-xs text-gray-600">
                        Loading...
                      </span>
                    </div>
                  ) : workersError ? (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-red-800 text-xs">{workersError}</p>
                    </div>
                  ) : workers.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                      <p className="text-yellow-800 text-xs">
                        No workers available
                      </p>
                    </div>
                  ) : (
                    <div onClick={(e) => e.stopPropagation()}>
                      <SearchableDropdown
                        options={workerOptions}
                        value={selectedWorkerId}
                        onChange={(value) =>
                          setSelectedWorkerId(value.toString())
                        }
                        placeholder="Select worker..."
                        className="w-full text-xs"
                      />
                    </div>
                  )}
                </div>

                {selectedWorkerId && (
                  <div className="flex space-x-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignWorker();
                      }}
                      disabled={isAssigning}
                      loading={isAssigning}
                      className="text-xs px-2 py-1"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelAssignment();
                      }}
                      disabled={isAssigning}
                      className="text-xs px-2 py-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ) : booking.worker_assignment ? (
              <div className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                <div className="flex-shrink-0 h-6 w-6">
                  <div className="h-6 w-6 rounded-full bg-blue-300 flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                </div>
                <div className="ml-2">
                  <div className="text-sm text-gray-900">
                    {booking.worker_assignment.worker ? (
                      <div>
                        <div className="font-medium">
                          {booking.worker_assignment.worker.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          {booking.worker_assignment.worker.phone}
                        </div>
                      </div>
                    ) : (
                      "Worker Assigned"
                    )}
                  </div>
                </div>
              </div>
            ) : canAssignWorker ? (
              <div
                className="text-sm text-gray-500 cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBookingId(booking.id);
                }}
              >
                Click to assign worker
              </div>
            ) : booking.booking_type === "inquiry" ? (
              <div className="text-sm text-gray-400 p-1">
                <div className="text-xs text-gray-500 mb-1">
                  Inquiry Booking
                </div>
                <div className="text-xs">
                  {booking.status === "pending" && "Quote needed first"}
                  {booking.status === "quote_provided" &&
                    "Waiting for customer"}
                  {booking.status === "quote_accepted" &&
                    "Ready for assignment"}
                  {booking.status === "scheduled" && "Ready for assignment"}
                  {booking.status === "assigned" && "Worker assigned"}
                  {booking.status === "in_progress" && "In progress"}
                  {booking.status === "completed" && "Completed"}
                  {booking.status === "cancelled" && "Cancelled"}
                  {booking.status === "rejected" && "Quote rejected"}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 p-1">
                Cannot assign worker
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const actions = [
    {
      label: "Quote",
      icon: <DollarSign size={14} />,
      onClick: (booking: OptimizedBookingResponse) => {
        if (onProvideQuote) {
          onProvideQuote(booking);
        }
      },
      className: (booking: OptimizedBookingResponse) =>
        booking.booking_type === "inquiry" && booking.status === "pending"
          ? "text-green-700 bg-green-100 hover:bg-green-200"
          : "text-gray-400 bg-gray-100 cursor-not-allowed",
      disabled: (booking: OptimizedBookingResponse) =>
        booking.booking_type !== "inquiry" ||
        booking.status !== "pending" ||
        !onProvideQuote,
    },
    {
      label: "Chat",
      icon: <MessageSquare size={14} />,
      onClick: (booking: OptimizedBookingResponse) => {
        if (onChat) {
          onChat(booking);
        }
      },
      className: (booking: OptimizedBookingResponse) =>
        booking.booking_type === "inquiry"
          ? "text-blue-700 bg-blue-100 hover:bg-blue-200"
          : "text-gray-400 bg-gray-100 cursor-not-allowed",
      disabled: (booking: OptimizedBookingResponse) =>
        booking.booking_type !== "inquiry" || !onChat,
    },
  ];

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No bookings found
        </h3>
        <p className="text-gray-600">
          No bookings match your current filters. Try adjusting your search
          criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Table<OptimizedBookingResponse>
        data={bookings}
        columns={columns}
        keyField="id"
        actions={actions}
        onRowClick={handleViewDetails}
        emptyState={
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">
              No bookings found
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        }
      />
    </div>
  );
};

export default BookingTable;
