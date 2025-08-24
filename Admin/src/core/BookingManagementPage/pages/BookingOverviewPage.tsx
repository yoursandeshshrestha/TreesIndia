"use client";

import React, { useEffect } from "react";
import { useBookings } from "@/hooks/useBookings";
import BookingStats from "../components/BookingStats";
import BookingCharts from "../components/BookingCharts";
import RecentBookings from "../components/RecentBookings";
import { OptimizedBookingResponse } from "@/types/booking";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export default function BookingOverviewPage() {
  const {
    dashboard,
    stats,
    isDashboardLoading,
    isStatsLoading,
    dashboardError,
    statsError,
    fetchDashboard,
    fetchStats,
    clearDashboardError,
    clearStatsError,
  } = useBookings();

  useEffect(() => {
    fetchDashboard();
    fetchStats();
  }, [fetchDashboard, fetchStats]);

  const handleViewBooking = (booking: OptimizedBookingResponse) => {
    toast.info(`Viewing booking: ${booking.booking_reference}`);
    // TODO: Navigate to booking details page
  };

  const handleRefresh = () => {
    fetchDashboard();
    fetchStats();
    toast.success("Data refreshed successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Booking Overview
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor your booking system performance
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isDashboardLoading || isStatsLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-600 ${
                  isDashboardLoading || isStatsLoading ? "animate-spin" : ""
                }`}
              />
              <span className="text-sm text-gray-700">Refresh</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Dashboard Stats */}
          <BookingStats
            stats={stats}
            isLoading={isStatsLoading}
            error={statsError}
            onRetry={fetchStats}
            onClearError={clearStatsError}
          />

          {/* Charts Section */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Analytics</h2>
            </div>
            <div className="p-6">
              <BookingCharts stats={stats} />
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Bookings
              </h2>
            </div>
            <div className="p-6">
              <RecentBookings
                bookings={dashboard?.recent_bookings || []}
                isLoading={isDashboardLoading}
                error={dashboardError}
                onClearError={clearDashboardError}
                onViewBooking={handleViewBooking}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
