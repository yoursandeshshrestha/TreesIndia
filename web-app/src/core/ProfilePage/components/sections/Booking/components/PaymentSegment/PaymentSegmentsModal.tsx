"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar } from "lucide-react";
import { Booking, PaymentProgress } from "@/types/booking";
import { formatAmount } from "@/utils/formatters";

interface PaymentSegmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  paymentProgress: PaymentProgress | null;
}

export default function PaymentSegmentsModal({
  isOpen,
  onClose,
  booking,
  paymentProgress,
}: PaymentSegmentsModalProps) {
  if (!isOpen || !booking || !paymentProgress) return null;

  const getSegmentStatusColor = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return "bg-red-100 text-red-800";
    }

    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
              onClick={onClose}
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-black" />
            </motion.button>

            <motion.div
              className="bg-white rounded-2xl w-[600px] max-w-[95vw] shadow-xl max-h-[80vh] overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Payment Segments
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Booking #{booking.booking_reference} - {booking.service?.name}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Payment Progress Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      Payment Progress
                    </h3>
                    <span className="text-sm text-gray-600">
                      {paymentProgress.paid_segments} of{" "}
                      {paymentProgress.total_segments} segments paid
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${paymentProgress.progress_percentage}%`,
                      }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Amount</span>
                      <div className="font-semibold text-gray-900">
                        {formatAmount(paymentProgress.total_amount)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Paid Amount</span>
                      <div className="font-semibold text-gray-900">
                        {formatAmount(paymentProgress.paid_amount)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Remaining</span>
                      <div className="font-semibold text-gray-900">
                        {formatAmount(paymentProgress.remaining_amount)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Segments List */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Payment Segments
                  </h4>

                  {paymentProgress.segments.map((segment) => (
                    <div key={segment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            Segment #{segment.segment_number}
                          </h5>
                          {segment.due_date && (
                            <div className="text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(
                                    segment.due_date
                                  ).toLocaleDateString("en-IN")}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatAmount(segment.amount)}
                            </div>
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-md ${getSegmentStatusColor(
                                segment.status,
                                segment.is_overdue
                              )}`}
                            >
                              {segment.status === "paid"
                                ? "PAID"
                                : segment.is_overdue
                                ? "OVERDUE"
                                : "PENDING"}
                            </span>
                          </div>
                          {segment.paid_at && (
                            <div className="text-xs text-gray-500 mt-1">
                              Paid on{" "}
                              {new Date(segment.paid_at).toLocaleDateString(
                                "en-IN"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
