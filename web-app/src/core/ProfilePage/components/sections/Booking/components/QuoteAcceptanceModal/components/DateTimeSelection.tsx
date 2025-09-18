"use client";

import { Loader2 } from "lucide-react";
import { AvailableSlot } from "@/types/booking";
import { BookingConfig, formatTime12Hour } from "@/utils/dateTimeUtils";

interface DateTimeSelectionProps {
  currentStep: string;
  selectedDate: string | null;
  selectedTimeSlot: AvailableSlot | null;
  availableSlots: AvailableSlot[];
  bookingConfig: BookingConfig | null;
  isLoading: boolean;
  onDateSelect: (date: string) => void;
  onTimeSlotSelect: (slot: AvailableSlot) => void;
  dateOptions: Array<{
    date: string;
    day: string;
    dayNumber: string;
  }>;
}

export default function DateTimeSelection({
  currentStep,
  selectedDate,
  selectedTimeSlot,
  availableSlots,
  bookingConfig,
  isLoading,
  onDateSelect,
  onTimeSlotSelect,
  dateOptions,
}: DateTimeSelectionProps) {
  if (currentStep !== "date" && currentStep !== "time") return null;

  return (
    <div className="p-4  h-auto  flex flex-col">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">
        Select Date & Time
      </h3>

      {/* Date Selection */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 text-xs mb-2">Select Date</h4>
        {!bookingConfig ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600 text-xs">
              Loading available dates...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {dateOptions.map((dateOption) => (
              <button
                key={dateOption.date}
                onClick={() => onDateSelect(dateOption.date)}
                className={`p-2 rounded-lg border transition-all text-center ${
                  selectedDate === dateOption.date
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-xs text-gray-500">{dateOption.day}</div>
                <div className="text-sm font-semibold text-gray-900">
                  {dateOption.dayNumber}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Time Selection - Show when date is selected */}
      {selectedDate && (
        <div className="flex-1">
          <h4 className="font-medium text-gray-700 text-xs mb-2">
            Select Time
          </h4>
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600 text-xs">
                Loading time slots...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => {
                    if (slot.is_available) {
                      onTimeSlotSelect(slot);
                    }
                  }}
                  disabled={!slot.is_available}
                  className={`p-2 rounded-lg border transition-all text-center ${
                    selectedTimeSlot?.time === slot.time
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  } ${
                    !slot.is_available
                      ? "opacity-50 cursor-not-allowed bg-gray-100"
                      : ""
                  }`}
                >
                  <span
                    className={`font-medium text-sm ${
                      !slot.is_available ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {formatTime12Hour(slot.time)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
