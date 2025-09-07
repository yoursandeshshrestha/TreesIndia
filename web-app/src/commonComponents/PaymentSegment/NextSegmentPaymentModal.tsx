"use client";

// NextSegmentPaymentModal - Updated to fix Razorpay integration
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Wallet, AlertCircle } from "lucide-react";
import { Booking, PaymentSegmentInfo } from "@/types/booking";
import { formatAmount } from "@/utils/formatters";
import { useBookings } from "@/hooks/useBookings";
import { createSegmentPaymentOrder } from "@/lib/bookingApi";
import { bookingFlowApi } from "@/lib/bookingFlowApi";
import RazorpayCheckout from "@/commonComponents/razorpay/RazorpayCheckout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<{
    id: string;
    amount: number;
    currency: string;
    key_id: string;
    payment_id?: number;
  } | null>(null);
  const { user } = useAuth();

  // Get payment progress from bookings data
  const { bookingsWithProgress, refetchBookings } = useBookings();

  // Try multiple matching strategies (same as MainBookingCard)
  const bookingWithProgress = bookingsWithProgress.find((item) => {
    // Primary match: ID comparison
    if (item.booking.ID === booking?.ID || item.booking.ID === booking?.id) {
      return true;
    }
    // Fallback match: booking reference comparison
    if (item.booking.booking_reference === booking?.booking_reference) {
      return true;
    }
    return false;
  });

  // Use payment progress from matched booking, or fallback to booking's own data
  const paymentProgress =
    bookingWithProgress?.booking?.payment_progress ||
    (booking as any)?.payment_progress;

  // Get the next pending segment (sorted by segment number)
  const nextSegment = paymentProgress?.segments
    .filter(
      (segment) => segment.status === "pending" || segment.status === "overdue"
    )
    .sort((a, b) => a.segment_number - b.segment_number)[0];

  // Check if this is the first segment (no segments paid yet)
  const isFirstSegment = paymentProgress && paymentProgress.paid_segments === 0;

  // Debug logging for segment selection
  if (booking?.booking_reference === "BK20250906113000") {
    console.log("NextSegmentPaymentModal debug:", {
      bookingRef: booking.booking_reference,
      paymentProgress,
      allSegments: paymentProgress?.segments,
      pendingSegments: paymentProgress?.segments?.filter(
        (segment) =>
          segment.status === "pending" || segment.status === "overdue"
      ),
      nextSegment,
      isFirstSegment,
      paidSegments: paymentProgress?.paid_segments,
      dataSource: bookingWithProgress ? "matched_booking" : "booking_fallback",
      bookingOwnPaymentProgress: (booking as any)?.payment_progress,
    });
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaySegment = async () => {
    if (!nextSegment || !selectedPaymentMethod) return;

    setIsProcessing(true);
    try {
      if (selectedPaymentMethod === "razorpay") {
        // Create payment order for Razorpay
        const response = await createSegmentPaymentOrder(
          booking?.ID || booking?.id || 0,
          {
            segment_number: nextSegment.segment_number,
            amount: nextSegment.amount,
          }
        );

        if (response.success && response.data) {
          console.log("Segment payment response:", response.data);

          // Try different possible response structures
          let order = null;
          let payment = null;

          if (response.data.payment_order?.payment_order) {
            order = response.data.payment_order.payment_order;
          } else if (response.data.payment_order) {
            order = response.data.payment_order;
          } else if (response.data.order) {
            order = response.data.order;
          }

          // Extract payment object if available
          if (response.data.payment) {
            payment = response.data.payment;
          }

          if (order && order.id) {
            setPaymentOrder({
              id: order.id as string,
              amount: order.amount as number,
              currency: order.currency as string,
              key_id: order.key_id as string,
              payment_id: payment?.ID || payment?.id, // Store payment ID for verification
            });
            setShowRazorpayCheckout(true);
          } else {
            console.error("Invalid payment order structure:", response.data);
          }
        }
      } else if (selectedPaymentMethod === "wallet") {
        // Handle wallet payment (direct payment)
        // TODO: Implement wallet payment for segments
        console.log("Wallet payment not implemented for segments yet");
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const canPayWithWallet = (amount: number) => {
    return (booking?.user?.wallet_balance || 0) >= amount;
  };

  const handleRazorpaySuccess = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      if (!booking?.ID && !booking?.id) {
        console.error("Booking ID not found for payment verification");
        return;
      }

      const bookingId = booking.ID || booking.id;

      console.log("Attempting payment verification:", {
        bookingId,
        bookingStatus: booking.status,
        paymentData,
        paymentOrder,
      });

      // Use dedicated segment payment verification endpoint
      console.log("Using segment payment verification");
      await bookingFlowApi.verifySegmentPayment(bookingId, {
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      // Refresh bookings to get updated payment progress
      await refetchBookings();

      // Show success message
      toast.success("Payment successful! Segment payment completed.");

      onPaymentSuccess?.();
      onClose();
    } catch (error) {
      console.error("Payment verification failed:", error);
      toast.error("Payment verification failed. Please contact support.");
    }
  };

  const handleRazorpayFailure = (error: Error) => {
    console.error("Razorpay payment failed:", error);
    toast.error("Payment failed. Please try again.");
  };

  const handleRazorpayClose = () => {
    setShowRazorpayCheckout(false);
    setPaymentOrder(null);
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
                  {isFirstSegment ? "Pay First Segment" : "Pay Next Segment"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Booking #{booking.booking_reference} - {booking.service?.name}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Segment Info */}
                <div
                  className={`border rounded-lg p-4 mb-6 ${
                    isFirstSegment
                      ? "bg-green-50 border-green-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className={`font-medium ${
                          isFirstSegment ? "text-green-900" : "text-blue-900"
                        }`}
                      >
                        {isFirstSegment
                          ? "First Payment"
                          : `Segment #${nextSegment.segment_number}`}
                      </h3>
                      {isFirstSegment ? (
                        <p
                          className={`text-sm mt-1 ${
                            isFirstSegment ? "text-green-700" : "text-blue-700"
                          }`}
                        >
                          Initial payment to start your service
                        </p>
                      ) : (
                        <>
                          {nextSegment.due_date && (
                            <p
                              className={`text-sm mt-1 ${
                                isFirstSegment
                                  ? "text-green-700"
                                  : "text-blue-700"
                              }`}
                            >
                              Due:{" "}
                              {new Date(
                                nextSegment.due_date
                              ).toLocaleDateString("en-IN")}
                            </p>
                          )}
                          {nextSegment.notes && (
                            <p
                              className={`text-sm mt-1 ${
                                isFirstSegment
                                  ? "text-green-700"
                                  : "text-blue-700"
                              }`}
                            >
                              {nextSegment.notes}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          isFirstSegment ? "text-green-900" : "text-blue-900"
                        }`}
                      >
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
                  {isFirstSegment ? "Pay First Segment" : "Pay Next Segment"}
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
                    disabled={isProcessing}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing
                      ? "Processing..."
                      : `Pay ${formatAmount(nextSegment.amount)}`}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Razorpay Checkout */}
      {showRazorpayCheckout && paymentOrder && (
        <RazorpayCheckout
          order={paymentOrder}
          description={`Segment ${nextSegment?.segment_number} payment for booking`}
          onSuccess={handleRazorpaySuccess}
          onFailure={handleRazorpayFailure}
          onClose={handleRazorpayClose}
        />
      )}
    </AnimatePresence>
  );
}
