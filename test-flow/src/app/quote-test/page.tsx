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
} from "lucide-react";
import { apiService, Booking } from "../../lib/api";

export default function QuoteTest() {
  const [token, setToken] = useState("");
  const [currentStep, setCurrentStep] = useState<
    "token" | "bookings" | "quote" | "success" | "error"
  >("token");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTokenSubmit = () => {
    if (token.trim()) {
      apiService.setAuthToken(token);
      setCurrentStep("bookings");
      loadInquiryBookings();
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
      await apiService.acceptQuote(booking.id);
      setSuccess(`Quote accepted for booking ${booking.booking_reference}`);
      setCurrentStep("success");
      // Refresh bookings
      loadInquiryBookings();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to accept quote");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectQuote = async (booking: Booking) => {
    setLoading(true);
    setError("");

    try {
      await apiService.rejectQuote(booking.id);
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

  const handleReset = () => {
    setToken("");
    setCurrentStep("token");
    setBookings([]);
    setSelectedBooking(null);
    setError("");
    setSuccess("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            Select a booking to accept or reject the quote
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
                key={booking.id}
                className="bg-white rounded-lg shadow border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.service.name}
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
                          Created: {formatDate(booking.created_at)}
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
                      <div className="text-green-600 text-sm font-medium">
                        Quote Accepted ✓
                      </div>
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
