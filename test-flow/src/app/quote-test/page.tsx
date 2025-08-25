"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Clock,
  User,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { apiService, Booking } from "../../lib/api";

export default function QuoteTest() {
  const [token, setToken] = useState("");
  const [currentStep, setCurrentStep] = useState<
    | "token"
    | "bookings"
    | "quote"
    | "date"
    | "time"
    | "payment"
    | "success"
    | "error"
  >("token");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [bookingConfig, setBookingConfig] = useState<Record<string, string>>({});

  const handleTokenSubmit = () => {
    if (token.trim()) {
      apiService.setAuthToken(token);
      setCurrentStep("bookings");
      loadInquiryBookings();
      loadBookingConfig();
    }
  };

  const loadBookingConfig = async () => {
    try {
      const config = await apiService.getBookingConfig();
      setBookingConfig(config);
    } catch (err) {
      console.error("Failed to load booking config:", err);
      // Use default values if config fails to load
      setBookingConfig({
        working_hours_start: "09:00",
        working_hours_end: "22:00",
        booking_advance_days: "7",
        booking_buffer_time_minutes: "30",
      });
    }
  };

  const loadInquiryBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiService.getUserBookings();
      // Filter for inquiry bookings with quotes provided
      const inquiryBookings = data.filter(
        (booking) =>
          booking.booking_type === "inquiry" &&
          (booking.status === "quote_provided" ||
            booking.status === "quote_accepted")
      );
      setBookings(inquiryBookings);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (booking: Booking) => {
    setLoading(true);
    setError("");

    try {
      const bookingId = booking.ID || booking.id;
      if (!bookingId) {
        throw new Error("Booking ID not found");
      }
      await apiService.acceptQuote(
        bookingId,
        "Quote accepted via test interface"
      );
      setSelectedBooking(booking);
      setCurrentStep("date");
      // Refresh bookings
      loadInquiryBookings();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to accept quote");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueFlow = async (booking: Booking) => {
    setSelectedBooking(booking);
    setCurrentStep("date");
  };

  const handleRejectQuote = async (booking: Booking) => {
    setLoading(true);
    setError("");

    try {
      const bookingId = booking.ID || booking.id;
      if (!bookingId) {
        throw new Error("Booking ID not found");
      }
      await apiService.rejectQuote(
        bookingId,
        "Quote rejected via test interface"
      );
      setSuccess(`Quote rejected for booking ${booking.booking_reference}`);
      setCurrentStep("success");
      // Refresh bookings
      loadInquiryBookings();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reject quote");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (date: string) => {
    if (!selectedBooking) return;

    setSelectedDate(date);
    setLoading(true);
    setError("");

    try {
      const data = await apiService.getAvailableSlots(
        selectedBooking.service?.id || 0,
        date
      );
      setAvailableSlots(data.available_slots || []);
      setCurrentStep("time");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load available slots");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotSelect = (timeSlot: any) => {
    setSelectedTimeSlot(timeSlot);
    setCurrentStep("payment");
  };

  const handlePayment = async () => {
    if (!selectedBooking || !selectedDate || !selectedTimeSlot) {
      setError("Please select date and time before proceeding to payment");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bookingId = selectedBooking.ID || selectedBooking.id;
      if (!bookingId) {
        throw new Error("Booking ID not found");
      }

      // Create payment order for quote amount
      const response = await apiService.createQuotePayment(bookingId, {
        scheduled_date: selectedDate,
        scheduled_time: selectedTimeSlot.time,
        amount: selectedBooking.quote_amount || 0,
      });

      if (response.payment_order) {
        setPaymentOrder(response.payment_order);
        handleRazorpayPayment(response.payment_order, bookingId);
      } else {
        setError("Failed to create payment order");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to process payment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = (paymentOrder: any, bookingId: number) => {
    // Load Razorpay script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const options = {
        key: paymentOrder.key_id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Trees India Services",
        description: `Quote Payment - ${selectedBooking?.service?.name}`,
        order_id: paymentOrder.id,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true,
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await apiService.verifyQuotePayment(
              bookingId,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: paymentOrder.id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            setSuccess(
              `Quote payment successful! Booking confirmed for ${selectedDate} at ${selectedTimeSlot.time}`
            );
            setCurrentStep("success");
            loadInquiryBookings();
          } catch (error) {
            console.error("Payment verification failed:", error);
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: selectedBooking?.contact_person || "",
          contact: selectedBooking?.contact_phone || "",
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function () {
            // Payment modal closed
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    script.onerror = () => {
      setError("Failed to load payment gateway");
    };
    document.head.appendChild(script);
  };

  const handleReset = () => {
    setToken("");
    setCurrentStep("token");
    setBookings([]);
    setSelectedBooking(null);
    setError("");
    setSuccess("");
    setSelectedDate("");
    setSelectedTimeSlot(null);
    setAvailableSlots([]);
    setPaymentOrder(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date for display (similar to main booking flow)
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate days based on booking_advance_days configuration
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    const advanceDays = parseInt(bookingConfig.booking_advance_days || "7");

    for (let i = 1; i <= advanceDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date.toISOString().split("T")[0]); // YYYY-MM-DD format
    }
    return days;
  };

  // Format time for display (convert from HH:MM to 12-hour format)
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "quote_provided":
        return "bg-blue-100 text-blue-800";
      case "quote_accepted":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (currentStep === "token") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Quote Acceptance Test
              </h1>
              <p className="text-gray-600">
                Test quote acceptance flow for inquiry bookings
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JWT Token
                </label>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your JWT token here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste your JWT token to authenticate and test quote acceptance
                </p>
              </div>

              <button
                onClick={handleTokenSubmit}
                disabled={!token.trim()}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Quote Test
              </button>

              <div className="text-center">
                <a
                  href="/"
                  className="text-sm text-green-600 hover:text-green-700 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Main Test Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "date") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">
                Quote Acceptance Test
              </h1>
              <button
                onClick={() => setCurrentStep("bookings")}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Back to Bookings
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      stepNumber <= 2
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber < 2 ? <CheckCircle size={16} /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <ChevronRight
                      className={`mx-2 ${
                        stepNumber < 2 ? "text-green-600" : "text-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-6">Select Service Date</h2>
              {selectedBooking && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">Selected Service: {selectedBooking.service?.name}</h3>
                  <p className="text-gray-600">Quote-based service booking</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Working Hours:</span>{" "}
                    {bookingConfig.working_hours_start || "09:00"} -{" "}
                    {bookingConfig.working_hours_end || "22:00"}
                  </div>
                  {selectedBooking.quote_amount && (
                    <div className="mt-2 text-sm text-green-600">
                      <span className="font-medium">Quote Amount:</span> ₹{selectedBooking.quote_amount}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getNextDays().map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                  >
                    <h3 className="font-semibold text-lg">{formatDisplayDate(date)}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "time") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">
                Quote Acceptance Test
              </h1>
              <button
                onClick={() => setCurrentStep("date")}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Back to Date Selection
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      stepNumber <= 3
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber < 3 ? <CheckCircle size={16} /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <ChevronRight
                      className={`mx-2 ${
                        stepNumber < 3 ? "text-green-600" : "text-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Select Time Slot</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Available time slots for {formatDisplayDate(selectedDate)}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading time slots...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No available time slots for this date
                </p>
                <button
                  onClick={() => setCurrentStep("date")}
                  className="mt-2 text-sm text-green-600 hover:text-green-700"
                >
                  Choose Different Date
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeSlotSelect(slot)}
                    disabled={!slot.is_available}
                    className={`p-4 border rounded-lg transition-colors text-left ${
                      slot.is_available
                        ? "border-gray-200 hover:border-green-500 hover:bg-green-50 cursor-pointer"
                        : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3
                          className={`font-semibold text-lg ${
                            slot.is_available ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {formatTime(slot.time)}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${
                            slot.is_available ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {slot.is_available
                            ? `${slot.available_workers} worker${
                                slot.available_workers !== 1 ? "s" : ""
                              } available`
                            : "No workers available"}
                        </p>
                      </div>
                      {!slot.is_available && (
                        <div className="text-gray-400">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "payment") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">
                Quote Acceptance Test
              </h1>
              <button
                onClick={() => setCurrentStep("time")}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Back to Time Selection
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      stepNumber <= 4
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber < 4 ? <CheckCircle size={16} /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <ChevronRight
                      className={`mx-2 ${
                        stepNumber < 4 ? "text-green-600" : "text-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Summary
              </h2>
              <p className="text-gray-600">
                Complete your booking by paying the quote amount
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Booking Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">
                      {selectedBooking?.service?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDisplayDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {formatTime(selectedTimeSlot?.time)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quote Amount:</span>
                    <span className="font-medium">
                      ₹{selectedBooking?.quote_amount}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {loading
                  ? "Processing..."
                  : `Pay ₹${selectedBooking?.quote_amount}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="mx-auto w-16 h-16 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">{success}</p>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentStep("bookings")}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Continue Testing
              </button>
              <button
                onClick={handleReset}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="mx-auto w-16 h-16 text-red-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentStep("bookings")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={handleReset}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Quote Acceptance Test
            </h1>
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Reset Flow
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Inquiry Bookings with Quotes
          </h2>
          <p className="text-gray-600">
            Select a booking to accept or reject the quote, or continue with already accepted quotes
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadInquiryBookings}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">
              No inquiry bookings with quotes found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Create an inquiry booking first and wait for admin to provide a
              quote
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.ID || booking.id}
                className="bg-white rounded-lg shadow border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.service?.name || "Unknown Service"}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          Booking Ref: {booking.booking_reference}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          Created:{" "}
                          {formatDate(
                            booking.CreatedAt || booking.created_at || ""
                          )}
                        </div>
                        {booking.quote_amount && (
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Quote Amount: ₹{booking.quote_amount}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {booking.quote_notes && (
                          <div className="text-sm text-gray-600">
                            <strong>Quote Notes:</strong> {booking.quote_notes}
                          </div>
                        )}
                        {booking.quote_provided_at && (
                          <div className="text-sm text-gray-600">
                            <strong>Quote Provided:</strong>{" "}
                            {formatDate(booking.quote_provided_at)}
                          </div>
                        )}
                        {booking.quote_expires_at && (
                          <div className="text-sm text-gray-600">
                            <strong>Expires:</strong>{" "}
                            {formatDate(booking.quote_expires_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {booking.status === "quote_provided" && (
                      <>
                        <button
                          onClick={() => handleAcceptQuote(booking)}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Quote
                        </button>
                        <button
                          onClick={() => handleRejectQuote(booking)}
                          disabled={loading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Reject Quote
                        </button>
                      </>
                    )}
                    {booking.status === "quote_accepted" && (
                      <button
                        onClick={() => handleContinueFlow(booking)}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Continue Flow
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
