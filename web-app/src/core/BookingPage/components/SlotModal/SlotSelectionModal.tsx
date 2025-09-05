"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { AvailableSlot } from "@/types/booking";
import { useAppSelector } from "@/store/hooks";
import { bookingFlowApi } from "@/lib/bookingFlowApi";
import { toast } from "sonner";
import {
  generateDateOptions,
  formatTime,
  BookingConfig,
} from "@/utils/dateTimeUtils";
import { DateSelectionSkeleton } from "./DateSelectionSkeleton";
import { TimeSlotSkeleton } from "./TimeSlotSkeleton";

interface SlotSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null;
  selectedTimeSlot: AvailableSlot | null;
  availableSlots: AvailableSlot[];
  isLoading: boolean;
  onDateSelect: (date: string) => void;
  onTimeSlotSelect: (timeSlot: AvailableSlot) => void;
  onConfirm: () => void;
}

export default function SlotSelectionModal({
  isOpen,
  onClose,
  selectedDate,
  selectedTimeSlot,
  availableSlots,
  isLoading,
  onDateSelect,
  onTimeSlotSelect,
  onConfirm,
}: SlotSelectionModalProps) {
  const { selectedService } = useAppSelector((state) => state.booking);
  const [bookingConfig, setBookingConfig] = useState<BookingConfig | null>(
    null
  );

  // Fetch booking config and search animation on mount
  useEffect(() => {
    const fetchBookingConfig = async () => {
      try {
        const response = await bookingFlowApi.getBookingConfig();
        setBookingConfig(response.data);
      } catch {
        toast.error("Failed to load booking configuration. Please try again.");
      }
    };

    fetchBookingConfig();
  }, []);

  const dateOptions = bookingConfig ? generateDateOptions(bookingConfig) : [];

  const isConfirmDisabled = !selectedDate || !selectedTimeSlot;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className="relative"
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              onClick={onClose}
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-black" />
            </motion.button>

            <motion.div
              className="bg-white rounded-2xl min-w-lg max-w-[500px] w-full max-h-[90vh] overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      When should the professional arrive?
                    </h2>
                    {selectedService && (
                      <p className="text-gray-600 text-sm mt-1">
                        Service will take approx.{" "}
                        {selectedService.duration || "45 mins"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 overflow-y-auto max-h-[60vh] py-2">
                {/* Date Selection */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Select Date
                  </h3>
                  {!bookingConfig ? (
                    <DateSelectionSkeleton />
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {dateOptions.map((dateOption) => (
                        <button
                          key={dateOption.date}
                          onClick={() => onDateSelect(dateOption.date)}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedDate === dateOption.date
                              ? "border-[#00a871] bg-[#00a871]/5"
                              : "border-gray-100 bg-white hover:border-gray-200"
                          } ${
                            !dateOption.isAvailable
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={!dateOption.isAvailable}
                        >
                          <div className="text-center">
                            <div className="text-xs text-gray-500">
                              {dateOption.day}
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              {dateOption.dayNumber}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Time Slot Selection */}
                {selectedDate && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Select start time of service
                    </h3>
                    {isLoading ? (
                      <TimeSlotSkeleton />
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => onTimeSlotSelect(slot)}
                            className={`p-3 rounded-lg border transition-all ${
                              selectedTimeSlot?.time === slot.time
                                ? "border-[#00a871] bg-[#00a871]/5"
                                : "border-gray-100 bg-white hover:border-gray-200"
                            } ${
                              !slot.is_available
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={!slot.is_available}
                          >
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">
                                {formatTime(slot.time)}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No available time slots for this date
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 0">
                <button
                  onClick={onConfirm}
                  disabled={isConfirmDisabled}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isConfirmDisabled
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#00a871] text-white hover:bg-[#009a65]"
                  }`}
                >
                  Proceed to checkout
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
