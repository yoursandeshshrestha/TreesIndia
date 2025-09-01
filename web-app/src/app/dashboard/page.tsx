"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatButton } from "@/components/chat";
import { MessageCircle, Calendar, Clock, MapPin, User } from "lucide-react";
import Link from "next/link";

interface Booking {
  id: number;
  booking_reference: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  service: {
    name: string;
  };
  worker_assignment?: {
    worker?: {
      name: string;
    };
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user's bookings from API
    // For now, using mock data
    const mockBookings: Booking[] = [
      {
        id: 1,
        booking_reference: "BK20241201001",
        status: "assigned",
        scheduled_date: "2024-12-15",
        scheduled_time: "10:00:00",
        service: {
          name: "House Cleaning",
        },
        worker_assignment: {
          worker: {
            name: "John Doe",
          },
        },
      },
      {
        id: 2,
        booking_reference: "BK20241201002",
        status: "confirmed",
        scheduled_date: "2024-12-20",
        scheduled_time: "14:00:00",
        service: {
          name: "Plumbing Service",
        },
      },
    ];

    setTimeout(() => {
      setBookings(mockBookings);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || "User"}!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/chat"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Messages</h3>
                <p className="text-sm text-gray-600">Chat with workers</p>
              </div>
            </div>
          </Link>

          <Link
            href="/services"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Book Service</h3>
                <p className="text-sm text-gray-600">Schedule a new service</p>
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Profile</h3>
                <p className="text-sm text-gray-600">Manage your account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Bookings
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No bookings yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start by booking a service
                </p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">
                          {booking.service.name}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(booking.scheduled_time)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>#{booking.booking_reference}</span>
                        </div>
                      </div>
                      {booking.worker_assignment?.worker && (
                        <div className="mt-2 flex items-center space-x-1 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>
                            Assigned to: {booking.worker_assignment.worker.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <ChatButton
                        bookingId={booking.id}
                        variant="outline"
                        size="sm"
                      />
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
