"use client";

import { useState } from "react";
import BookingFlow from "../components/BookingFlow";
import UserBookings from "../components/UserBookings";
import { Key, User, BookOpen, List, Wallet } from "lucide-react";

export default function Home() {
  const [token, setToken] = useState("");
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [activeTab, setActiveTab] = useState<"booking" | "bookings">("booking");

  const handleStartBooking = () => {
    if (token.trim()) {
      setShowBookingFlow(true);
      setActiveTab("booking");
    }
  };

  const handleReset = () => {
    setShowBookingFlow(false);
    setToken("");
  };

  if (showBookingFlow) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">
                TREESINDIA Service Booking
              </h1>
              <button
                onClick={handleReset}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Reset Flow
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 mt-4">
              <button
                onClick={() => setActiveTab("booking")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "booking"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <BookOpen className="inline w-4 h-4 mr-1" />
                Book Service
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "bookings"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="inline w-4 h-4 mr-1" />
                My Bookings
              </button>
            </div>
          </div>
        </div>

        {activeTab === "booking" ? (
          <BookingFlow token={token} />
        ) : (
          <UserBookings token={token} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              TREESINDIA
            </h1>
            <p className="text-gray-600">Service Booking Test Frontend</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="inline w-4 h-4 mr-1" />
                JWT Token
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your JWT token here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste your JWT token to authenticate and start booking services
              </p>
            </div>

            <button
              onClick={handleStartBooking}
              disabled={!token.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <User className="w-4 h-4 mr-2" />
              Start Booking Flow
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                This is a test frontend for the TREESINDIA service booking
                system
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Get a JWT token from the backend (login/signup)</li>
              <li>2. Paste the token in the field above</li>
              <li>3. Click &quot;Start Booking Flow&quot;</li>
              <li>4. Follow the step-by-step booking process</li>
              <li>5. Test both fixed-price and inquiry-based services</li>
            </ol>
            
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Other Test Pages:</h4>
              <div className="flex space-x-2">
                <a
                  href="/wallet-test"
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                >
                  <Wallet className="w-4 h-4 mr-1" />
                  Wallet Test
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
