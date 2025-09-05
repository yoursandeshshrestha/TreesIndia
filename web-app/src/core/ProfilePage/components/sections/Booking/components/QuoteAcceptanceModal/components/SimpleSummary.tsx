"use client";

import { Booking } from "@/lib/bookingApi";
import { formatAmount } from "@/utils/formatters";

interface SimpleSummaryProps {
  booking: Booking;
}

export default function SimpleSummary({ booking }: SimpleSummaryProps) {
  return (
    <div className="p-6 h-full flex flex-col">
      <h3 className="font-semibold text-gray-900 text-lg mb-4">
        Payment Summary
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Service</span>
          <span className="font-medium">{booking.service?.name}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Quote Amount</span>
          <span className="font-medium">
            {formatAmount(booking.quote_amount || 0)}
          </span>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-semibold">Total Amount</span>
            <span className="text-gray-900 font-semibold text-lg">
              {formatAmount(booking.quote_amount || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
