"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Wallet, AlertCircle } from "lucide-react";
import { Booking, PaymentSegmentInfo } from "@/types/booking";
import { formatAmount } from "@/utils/formatters";
import { usePaymentSegments } from "@/hooks/usePaymentSegments";

interface NextSegmentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentSuccess?: () => void;
}

type PaymentMethod = "wallet" | "razorpay";

export default function NextSegmentPaymentModal({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}: NextSegmentPaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { paymentProgress, paySegment, isPayingSegment } = usePaymentSegments(
    booking?.ID || booking?.id
  );

  // Get the next pending segment
  const nextSegment = paymentProgress?.segments.find(
    (segment) => segment.status === "pending" || segment.status === "overdue"
  );

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaySegment = async () => {
    if (!nextSegment || !selectedPaymentMethod) return;

    setIsProcessing(true);
    try {
      await paySegment({
        bookingId: booking?.ID || booking?.id || 0,
        paymentData: {
          segment_number: nextSegment.segment_number,
          amount: nextSegment.amount,
        },
      });

      onPaymentSuccess?.();
      onClose();
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const canPayWithWallet = (amount: number) => {
    return (booking?.user?.wallet_balance || 0) >= amount;
  };

  if (!isOpen || !booking || !nextSegment) return null;

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
              className="bg-white rounded-2xl w-[500px] max-w-[95vw] shadow-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Pay Next Segment
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Booking #{booking.booking_reference} - {booking.service?.name}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Segment Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">
                        Segment #{nextSegment.segment_number}
                      </h3>
                      {nextSegment.due_date && (
                        <p className="text-sm text-blue-700 mt-1">
                          Due:{" "}
                          {new Date(nextSegment.due_date).toLocaleDateString(
                            "en-IN"
                          )}
                        </p>
                      )}
                      {nextSegment.notes && (
                        <p className="text-sm text-blue-700 mt-1">
                          {nextSegment.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">
                        {formatAmount(nextSegment.amount)}
                      </div>
                      {nextSegment.status === "overdue" && (
                        <div className="flex items-center text-red-600 text-sm mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Overdue
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <h4 className="font-medium text-gray-900 mb-3">
                  Select Payment Method
                </h4>
                <div className="space-y-3 mb-6">
                  {/* Wallet Payment */}
                  <button
                    onClick={() => handlePaymentMethodSelect("wallet")}
                    disabled={!canPayWithWallet(nextSegment.amount)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedPaymentMethod === "wallet"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    } ${
                      !canPayWithWallet(nextSegment.amount)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Wallet className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            Pay with Wallet
                          </p>
                          <p className="text-xs text-gray-600">
                            Balance:{" "}
                            {formatAmount(booking.user?.wallet_balance || 0)}
                            {!canPayWithWallet(nextSegment.amount) && (
                              <span className="text-red-600 ml-2">
                                (Insufficient balance)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {selectedPaymentMethod === "wallet" && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Razorpay Payment */}
                  <button
                    onClick={() => handlePaymentMethodSelect("razorpay")}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedPaymentMethod === "razorpay"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            Pay with Razorpay
                          </p>
                          <p className="text-xs text-gray-600">
                            Credit/Debit Card, UPI, Net Banking
                          </p>
                        </div>
                      </div>
                      {selectedPaymentMethod === "razorpay" && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Pay Button */}
                {selectedPaymentMethod && (
                  <button
                    onClick={handlePaySegment}
                    disabled={isProcessing || isPayingSegment}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing || isPayingSegment
                      ? "Processing..."
                      : `Pay ${formatAmount(nextSegment.amount)}`}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
