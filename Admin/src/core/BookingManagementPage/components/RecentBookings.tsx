import React from "react";
import { Chip, Button } from "@mui/material";
import { Eye, Phone, Clock, Calendar } from "lucide-react";
import { OptimizedBookingResponse } from "@/types/booking";
import { displayValue, displayDate, displayTime } from "@/utils/displayUtils";

interface BadgeProps {
  text: string;
  color: string;
}

const Badge: React.FC<BadgeProps> = ({ text, color }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${color}`}
  >
    {text}
  </span>
);

interface RecentBookingsProps {
  bookings: OptimizedBookingResponse[];
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
  onViewBooking: (booking: OptimizedBookingResponse) => void;
}

const RecentBookings: React.FC<RecentBookingsProps> = ({
  bookings,
  isLoading,
  error,
  onClearError,
  onViewBooking,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-600 text-white";
      case "pending":
        return "bg-amber-500 text-white";
      case "confirmed":
        return "bg-sky-600 text-white";
      case "in_progress":
        return "bg-violet-600 text-white";
      case "cancelled":
        return "bg-rose-600 text-white";
      case "payment_pending":
        return "bg-orange-500 text-white";
      case "temporary_hold":
        return "bg-slate-500 text-white";
      case "assigned":
        return "bg-cyan-600 text-white";
      case "time_expired":
        return "bg-red-600 text-white";
      case "rejected":
        return "bg-red-700 text-white";
      case "quote_provided":
        return "bg-purple-600 text-white";
      case "quote_accepted":
        return "bg-indigo-600 text-white";
      case "scheduled":
        return "bg-blue-600 text-white";
      default:
        return "bg-slate-400 text-white";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "fixed_price":
        return "bg-blue-600 text-white";
      case "hourly":
        return "bg-teal-600 text-white";
      case "inquiry":
        return "bg-amber-600 text-white";
      default:
        return "bg-slate-400 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return displayDate(dateString, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return displayTime(dateString);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
        <span className="ml-2 text-gray-600">Loading recent bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-red-600">
            <span className="font-medium">Error loading recent bookings:</span>{" "}
            {error}
          </div>
          <button
            onClick={onClearError}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent bookings found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">
              Service
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">
              Customer
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">
              Type
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">
              Status
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">
              Date
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">
              Time
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4">
                <div className="font-medium text-gray-900">
                  {booking.service.name}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{booking.user.phone}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {displayValue(booking.user.name, "Name not provided")}
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge
                  text={booking.booking_type.replace("_", " ")}
                  color={getTypeColor(booking.booking_type)}
                />
              </td>
              <td className="py-3 px-4">
                <Badge
                  text={booking.status.replace("_", " ")}
                  color={getStatusColor(booking.status)}
                />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {formatDate(booking.created_at)}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {formatTime(booking.created_at)}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => onViewBooking(booking)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentBookings;
