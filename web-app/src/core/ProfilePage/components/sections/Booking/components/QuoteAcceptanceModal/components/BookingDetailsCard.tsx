"use client";

import { Phone, MapPin, Clock, CreditCard, FileText } from "lucide-react";
import { Booking } from "@/lib/bookingApi";
import { AvailableSlot } from "@/types/booking";
import { useQuoteAcceptanceRedux } from "@/hooks/useQuoteAcceptanceRedux";
import { formatTime12Hour } from "@/utils/dateTimeUtils";

interface BookingDetailsCardProps {
  booking: Booking;
  selectedDate: string | null;
  selectedTimeSlot: AvailableSlot | null;
  currentStep: string;
  getAddressName: (address: Record<string, unknown>) => string;
  getAddressDetails: (address: Record<string, unknown>) => string;
  hasMultipleSegments?: boolean;
}

export default function BookingDetailsCard({
  booking,
  selectedDate,
  selectedTimeSlot,
  currentStep,
  getAddressName,
  getAddressDetails,
  hasMultipleSegments = false,
}: BookingDetailsCardProps) {
  const {
    handleSetCurrentStep,
    handleSetSelectedDate,
    handleSetSelectedTimeSlot,
  } = useQuoteAcceptanceRedux();

  const handleChangeSlot = () => {
    // Reset date and time selections
    handleSetSelectedDate(null);
    handleSetSelectedTimeSlot(null);
    // Go back to date selection step
    handleSetCurrentStep("date");
  };
  return (
    <div className="bg-white p-6 ">
      {/* Send booking details to */}
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Phone className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">
            Send booking details to
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {booking.contact?.person}
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <MapPin className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">Address</p>
          <div className="mt-1">
            <p className="text-gray-600 text-xs">
              <span className="text-gray-900 font-medium">
                {booking.address?.name || "Home"}
              </span>{" "}
              - {booking.address?.address}, {booking.address?.city}
            </p>
          </div>
        </div>
      </div>

      {/* Quote Information */}
      {booking.quote_duration && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">
              Service Duration
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {booking.quote_duration}
            </p>
          </div>
        </div>
      )}
      {booking.quote_notes && (
        <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Quote Notes</p>
            <p className="text-gray-600 text-sm mt-1">{booking.quote_notes}</p>
          </div>
        </div>
      )}

      {/* Slot Selection - Only show for single segment bookings */}
      {!hasMultipleSegments && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Slot</p>
            {selectedDate && selectedTimeSlot && (
              <div className="mt-1">
                <p className="text-gray-900 text-sm font-medium">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-900 text-sm font-medium mt-1">
                  at {formatTime12Hour(selectedTimeSlot.time)}
                </p>
              </div>
            )}
          </div>
          {selectedDate && selectedTimeSlot ? (
            <button
              onClick={handleChangeSlot}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer self-center"
            >
              Change
            </button>
          ) : (
            <button
              onClick={handleChangeSlot}
              className="bg-[#00a871] hover:bg-[#009a65] text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer self-center"
            >
              Select slot
            </button>
          )}
        </div>
      )}

      {/* Payment Method */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1">
          <p
            className={`font-semibold text-gray-900 text-sm ${
              currentStep === "payment" ? "" : "text-gray-400"
            }`}
          >
            Summary & Payment Method
          </p>
        </div>
      </div>
    </div>
  );
}
