"use client";

import React, { useState, useEffect } from "react";
import { useBookings } from "@/hooks/useBookings";
import BookingTable from "../components/BookingTable";
import { OptimizedBookingResponse } from "@/types/booking";
import { toast } from "sonner";
import { Loader, Calendar } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { assignWorkerToBooking } from "@/lib/api-client";

// Components
import BookingHeader from "../components/BookingHeader";
import BookingFilters from "../components/BookingFilters";
import QuoteModal from "../components/QuoteModal";

export default function BookingManagementPage() {
  const { bookings, isLoading, error, fetchBookings, clearError } =
    useBookings();

  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [selectedBooking, setSelectedBooking] =
    useState<OptimizedBookingResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Quote modal state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteBooking, setQuoteBooking] =
    useState<OptimizedBookingResponse | null>(null);

  // Tab management - removed, keeping only main table

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    bookingType: "",
    paymentStatus: "",
  });

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  // Load bookings when filters or pagination changes
  useEffect(() => {
    fetchBookings();
  }, [currentPage, itemsPerPage, filters]);

  const handleBookingSelect = (booking: OptimizedBookingResponse) => {
    setSelectedBooking(booking);
    toast.info(`Selected booking: ${booking.booking_reference}`);
  };

  const handleStatusUpdate = (booking: OptimizedBookingResponse) => {
    toast.info(`Update status for booking: ${booking.booking_reference}`);
  };

  const handleWorkerAssignment = async (
    bookingId: number,
    workerId: number
  ) => {
    try {
      await assignWorkerToBooking(bookingId, { worker_id: workerId });
      toast.success("Worker assigned successfully");
      fetchBookings(); // Refresh the bookings list
    } catch (error) {
      toast.error("Failed to assign worker");
    }
  };

  const handleDelete = (booking: OptimizedBookingResponse) => {
    toast.info(`Delete booking: ${booking.booking_reference}`);
  };

  const handleRefresh = () => {
    fetchBookings();
    toast.success("Data refreshed successfully!");
  };

  const handleProvideQuote = (booking: OptimizedBookingResponse) => {
    setQuoteBooking(booking);
    setIsQuoteModalOpen(true);
  };

  const handleChat = (booking: OptimizedBookingResponse) => {
    // TODO: Implement chat functionality
    toast.info(`Open chat for booking: ${booking.booking_reference}`);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      bookingType: "",
      paymentStatus: "",
    });
    setLocalSearch("");
    setCurrentPage(1);
  };

  const filteredBookings = bookings.filter((booking) => {
    // Apply status filter
    if (filters.status && booking.status !== filters.status) return false;

    // Apply booking type filter
    if (filters.bookingType && booking.booking_type !== filters.bookingType)
      return false;

    // Apply payment status filter
    if (
      filters.paymentStatus &&
      booking.payment_status !== filters.paymentStatus
    )
      return false;

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        booking.service.name.toLowerCase().includes(searchTerm) ||
        booking.user.name.toLowerCase().includes(searchTerm) ||
        booking.user.phone.includes(searchTerm) ||
        booking.booking_reference.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    return true;
  });

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    bookings.forEach((booking) => {
      if (booking.status === "pending") counts.pending++;
      else if (booking.status === "confirmed") counts.confirmed++;
      else if (booking.status === "completed") counts.completed++;
      else if (booking.status === "cancelled") counts.cancelled++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BookingHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
        }}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Status Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {statusCounts.pending}
              </p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-semibold text-blue-600">
                {statusCounts.confirmed}
              </p>
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-green-600">
                {statusCounts.completed}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-semibold text-red-600">
                {statusCounts.cancelled}
              </p>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <BookingFilters
        search={localSearch}
        status={filters.status}
        bookingType={filters.bookingType}
        paymentStatus={filters.paymentStatus}
        onSearchChange={(value) => {
          setLocalSearch(value);
          setIsSearching(true);
        }}
        onStatusChange={(value) => {
          setFilters((prev) => ({ ...prev, status: value }));
          setCurrentPage(1);
        }}
        onBookingTypeChange={(value) => {
          setFilters((prev) => ({ ...prev, bookingType: value }));
          setCurrentPage(1);
        }}
        onPaymentStatusChange={(value) => {
          setFilters((prev) => ({ ...prev, paymentStatus: value }));
          setCurrentPage(1);
        }}
        onClear={clearFilters}
        isSearching={isSearching}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-red-600">
              <span className="font-medium">Error loading bookings:</span>{" "}
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
        onWorkerAssignment={handleWorkerAssignment}
        isAssigning={false}
        onProvideQuote={handleProvideQuote}
        onChat={handleChat}
      />

      {filteredBookings.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center h-[400px] w-full flex items-center justify-center">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No bookings found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      <QuoteModal
        booking={quoteBooking}
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setQuoteBooking(null);
        }}
        onSuccess={() => {
          fetchBookings(); // Refresh the bookings list
        }}
      />
    </div>
  );
}
