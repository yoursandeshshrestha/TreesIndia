"use client";

import React, { useState, useEffect } from "react";
import { useBookings } from "@/hooks/useBookings";
import BookingTable from "../components/BookingTable";
import { OptimizedBookingResponse } from "@/types/booking";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";

export default function InquiryPriceBooking() {
  const { bookings, isLoading, error, fetchBookings, clearError } =
    useBookings();

  const [selectedBooking, setSelectedBooking] =
    useState<OptimizedBookingResponse | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleBookingSelect = (booking: OptimizedBookingResponse) => {
    setSelectedBooking(booking);
    toast.info(`Selected inquiry: ${booking.booking_reference}`);
  };

  const handleStatusUpdate = (booking: OptimizedBookingResponse) => {
    toast.info(`Update status for inquiry: ${booking.booking_reference}`);
  };

  const handleWorkerAssignment = (booking: OptimizedBookingResponse) => {
    toast.info(`Assign worker to inquiry: ${booking.booking_reference}`);
  };

  const handleWorkerRemoval = (booking: OptimizedBookingResponse) => {
    toast.info(`Remove worker from inquiry: ${booking.booking_reference}`);
  };

  const handleDelete = (booking: OptimizedBookingResponse) => {
    toast.info(`Delete inquiry: ${booking.booking_reference}`);
  };

  const handleRefresh = () => {
    fetchBookings();
    toast.success("Data refreshed successfully!");
  };

  const filteredBookings = bookings.filter((booking) => {
    // Filter by booking type (inquiry bookings only)
    return booking.booking_type === "inquiry";
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Inquiry Price Bookings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all inquiry-based booking requests
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 text-gray-600 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
                <span className="text-sm text-gray-700">Refresh</span>
              </button>
              <button
                onClick={() =>
                  toast.info("Create inquiry functionality coming soon")
                }
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Create Inquiry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Inquiries ({filteredBookings.length})
            </h2>
          </div>
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-red-600">
                    <span className="font-medium">
                      Error loading inquiries:
                    </span>{" "}
                    {error}
                  </div>
                  <button
                    onClick={clearError}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <BookingTable
              bookings={filteredBookings}
              onBookingSelect={handleBookingSelect}
              onStatusUpdate={handleStatusUpdate}
              onWorkerAssignment={handleWorkerAssignment}
              onWorkerRemoval={handleWorkerRemoval}
              onDelete={handleDelete}
              isUpdating={false}
              isAssigning={false}
              isRemoving={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
