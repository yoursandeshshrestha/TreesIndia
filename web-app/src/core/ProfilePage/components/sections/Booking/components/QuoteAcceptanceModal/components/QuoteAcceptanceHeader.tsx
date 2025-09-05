"use client";

import { Booking } from "@/lib/bookingApi";

interface QuoteAcceptanceHeaderProps {
  booking: Booking;
}

export function QuoteAcceptanceHeader({ booking }: QuoteAcceptanceHeaderProps) {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Accept Quote & Schedule Service
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {booking.service?.name} - {booking.booking_reference}
          </p>
        </div>
      </div>
    </div>
  );
}
