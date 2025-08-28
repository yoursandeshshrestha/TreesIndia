"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Search } from "lucide-react";
import { toast } from "sonner";
import { useFilteredBookings } from "@/hooks/useBookings";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmModal } from "@/components/ConfirmModal";
import CancelBookingModal from "@/components/CancelBookingModal";
import { BookingsSectionSkeleton } from "./BookingsSectionSkeleton";
import { MainBookingCard } from "@/components/BookingCard";
import { QuoteAcceptanceModal } from "@/components/QuoteAcceptanceModal";
import type { Booking } from "@/lib/bookingApi";

type BookingTab = "all" | "upcoming" | "completed" | "cancelled";

export function BookingsSection() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<BookingTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Define filters for each tab
  const getFiltersForTab = (tab: BookingTab) => {
    const baseFilters: any = {};

    switch (tab) {
      case "upcoming":
        baseFilters.status =
          "confirmed,scheduled,assigned,in_progress,pending,quote_provided";
        break;
      case "completed":
        baseFilters.status = "completed";
        break;
      case "cancelled":
        baseFilters.status = "cancelled,rejected";
        break;
    }

    return baseFilters;
  };

  const {
    bookings,
    isLoadingBookings,
    isCancellingBooking,
    isAcceptingQuote,
    cancelBookingAsync,
    acceptQuoteAsync,
    rejectQuoteAsync,
    refetchBookings,
    bookingsError,
  } = useFilteredBookings(getFiltersForTab(activeTab));

  // Client-side filtering for search (temporary until backend supports search)
  const filteredBookings = bookings.filter((booking) => {
    if (!debouncedSearchQuery.trim()) return true;

    const searchLower = debouncedSearchQuery.toLowerCase();
    return (
      booking.service?.name?.toLowerCase().includes(searchLower) ||
      booking.booking_reference.toLowerCase().includes(searchLower) ||
      booking.contact_person.toLowerCase().includes(searchLower) ||
      booking.contact_phone.includes(debouncedSearchQuery)
    );
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [showQuoteAcceptanceModal, setShowQuoteAcceptanceModal] =
    useState(false);
  const [bookingForQuote, setBookingForQuote] = useState<Booking | null>(null);

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async (
    bookingId: number,
    cancelData: { reason: string; cancellation_reason?: string }
  ) => {
    try {
      await cancelBookingAsync({ bookingId, cancelData });
      toast.success("Booking cancelled successfully");
      setShowCancelModal(false);
      setBookingToCancel(null);
      refetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const handleCancelClose = () => {
    setShowCancelModal(false);
    setBookingToCancel(null);
  };

  const handleAcceptQuote = async (booking: Booking) => {
    try {
      // First accept the quote
      await acceptQuoteAsync({
        bookingId: booking.ID,
        notes: "Quote accepted via web app",
      });

      // Refresh bookings to get updated status
      await refetchBookings();

      // Then open the modal for date/time selection and payment
      setBookingForQuote(booking);
      setShowQuoteAcceptanceModal(true);
    } catch (error) {
      console.error("Error accepting quote:", error);
      toast.error("Failed to accept quote. Please try again.");
    }
  };

  const handleRejectQuote = async (booking: Booking) => {
    try {
      await rejectQuoteAsync({
        bookingId: booking.ID,
        reason: "Quote rejected via web app",
      });
      refetchBookings();
    } catch (error) {
      console.error("Error rejecting quote:", error);
      toast.error("Failed to reject quote");
    }
  };

  const handleQuoteAcceptanceSuccess = () => {
    refetchBookings();
  };

  const handleQuoteAcceptanceClose = () => {
    setShowQuoteAcceptanceModal(false);
    setBookingForQuote(null);
  };

  const handleShare = (booking: Booking) => {
    // Implement share functionality
    const shareData = {
      title: `Booking: ${booking.service?.name}`,
      text: `Booking ID: ${booking.booking_reference}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Booking ID: ${booking.booking_reference}`);
      toast.success("Booking reference copied to clipboard");
    }
  };

  const handlePayNow = (booking: Booking) => {
    // Open quote acceptance modal for payment
    setBookingForQuote(booking);
    setShowQuoteAcceptanceModal(true);
  };

  const handleSelectDateAndPay = (booking: Booking) => {
    setBookingForQuote(booking);
    setShowQuoteAcceptanceModal(true);
  };

  const tabs: { id: BookingTab; label: string; count?: number }[] = [
    { id: "all", label: "All Bookings" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  if (bookingsError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">My Bookings</h2>
          <p className="text-gray-600 mt-1">
            View and manage your service bookings
          </p>
        </div>

        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <p className="font-medium">Unable to load bookings</p>
            <p className="text-sm text-gray-600 mt-1">
              There was an error loading your bookings. Please try again.
            </p>
          </div>
          <button
            onClick={() => refetchBookings()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">My Bookings</h2>
        <p className="text-gray-600 mt-1">
          View and manage your service bookings
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {isLoadingBookings ? (
          // Skeleton for loading state
          [1, 2, 3].map((i) => (
            <div key={i}>
              <div className="bg-white border-l-4 border-green-500 rounded-lg p-4">
                {/* Header Skeleton */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>

                {/* Information Grid Skeleton */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-36 animate-pulse"></div>
                  </div>
                </div>

                {/* Actions Skeleton */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking, index) => (
            <div key={booking.ID}>
              <MainBookingCard
                booking={booking}
                onCancel={handleCancelClick}
                onAcceptQuote={handleAcceptQuote}
                onRejectQuote={handleRejectQuote}
                onPayNow={handlePayNow}
                isAcceptingQuote={isAcceptingQuote}
                isPaying={false}
              />
              {index < filteredBookings.length - 1 && (
                <div className="border-b border-gray-200 my-4"></div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>
              {debouncedSearchQuery
                ? "No bookings found matching your search"
                : `No ${activeTab === "all" ? "" : activeTab} bookings yet`}
            </p>
            <p className="text-sm">
              {debouncedSearchQuery
                ? "Try adjusting your search terms"
                : "Your booking history will appear here"}
            </p>
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={showCancelModal}
        onClose={handleCancelClose}
        onBookingCancelled={() => refetchBookings()}
        bookingId={bookingToCancel?.ID || 0}
        serviceName={bookingToCancel?.service?.name || ""}
        bookingReference={bookingToCancel?.booking_reference || ""}
        onCancelBooking={handleCancelConfirm}
        isCancelling={isCancellingBooking}
      />

      {/* Quote Acceptance Modal */}
      <QuoteAcceptanceModal
        isOpen={showQuoteAcceptanceModal}
        onClose={handleQuoteAcceptanceClose}
        booking={bookingForQuote}
        onSuccess={handleQuoteAcceptanceSuccess}
      />
    </div>
  );
}
