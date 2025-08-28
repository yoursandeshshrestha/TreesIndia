"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCancelled?: () => void;
  bookingId: number;
  serviceName: string;
  bookingReference: string;
  onCancelBooking: (
    bookingId: number,
    cancelData: { reason: string; cancellation_reason?: string }
  ) => Promise<void>;
  isCancelling: boolean;
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onBookingCancelled,
  bookingId,
  serviceName,
  bookingReference,
  onCancelBooking,
  isCancelling,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");
  const [additionalReason, setAdditionalReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error("Please select a cancellation reason");
      return;
    }

    const cancelData = {
      reason: reason,
      cancellation_reason: additionalReason.trim() || undefined,
    };

    onCancelBooking(bookingId, cancelData)
      .then(() => {
        toast.success("Booking cancelled successfully");
        handleClose();
        onBookingCancelled?.();
      })
      .catch((error) => {
        console.error("Error cancelling booking:", error);
        toast.error("Failed to cancel booking. Please try again.");
      });
  };

  const handleClose = () => {
    setReason("");
    setAdditionalReason("");
    onClose();
  };

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
              onClick={handleClose}
              disabled={isCancelling}
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg disabled:opacity-50"
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
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Cancel Booking
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Are you sure you want to cancel this booking?
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Booking Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Booking Details:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">
                        {serviceName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Reference: {bookingReference}
                      </p>
                    </div>
                  </div>

                  {/* Cancellation Reason */}
                  <div>
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Cancellation Reason *
                    </label>
                    <select
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={isCancelling}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      required
                    >
                      <option value="">Select a reason</option>
                      <option value="schedule_conflict">
                        Schedule conflict
                      </option>
                      <option value="found_alternative">
                        Found alternative service
                      </option>
                      <option value="no_longer_needed">
                        Service no longer needed
                      </option>
                      <option value="price_concern">Price concern</option>
                      <option value="service_not_available">
                        Service not available
                      </option>
                      <option value="personal_emergency">
                        Personal emergency
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Additional Reason */}
                  <div>
                    <label
                      htmlFor="additionalReason"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Additional Details (Optional)
                    </label>
                    <textarea
                      id="additionalReason"
                      value={additionalReason}
                      onChange={(e) => setAdditionalReason(e.target.value)}
                      disabled={isCancelling}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="Please provide any additional details..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      onClick={handleClose}
                      disabled={isCancelling}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer font-medium disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Keep Booking
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isCancelling || !reason.trim()}
                      className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors cursor-pointer font-medium disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isCancelling ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Cancelling...
                        </div>
                      ) : (
                        "Cancel Booking"
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
