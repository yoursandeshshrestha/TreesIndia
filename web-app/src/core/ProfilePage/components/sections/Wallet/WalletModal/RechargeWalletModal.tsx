"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import RazorpayCheckout from "@/commonComponents/razorpay/RazorpayCheckout";

// Payment interfaces
interface PaymentOrder {
  key_id: string;
  amount: number;
  currency: string;
}

interface Payment {
  id?: number;
  ID?: number;
  amount: number;
  currency: string;
  razorpay_order_id: string;
  payment_order?: PaymentOrder;
}

interface RechargeResponse {
  payment: Payment;
  payment_order: PaymentOrder;
  message: string;
}

interface RechargeWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRechargeSuccess?: () => void;
  onRecharge: (amount: number) => Promise<RechargeResponse>;
  onCompleteRecharge: (
    paymentId: number,
    paymentData: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }
  ) => Promise<void>;
  onRefreshOrder?: (paymentId: number) => Promise<RechargeResponse>;
  isLoading?: boolean;
}

export default function RechargeWalletModal({
  isOpen,
  onClose,
  onRechargeSuccess,
  onRecharge,
  onCompleteRecharge,
  onRefreshOrder,
  isLoading = false,
}: RechargeWalletModalProps) {
  const [amount, setAmount] = useState("");
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsProcessingPayment(true);
      const response = await onRecharge(parseFloat(amount));

      // Store payment info for completion
      setCurrentPayment(response.payment);

      // Show Razorpay checkout
      setShowRazorpayCheckout(true);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create recharge"
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    try {
      setIsProcessingPayment(true);

      // Complete the recharge with payment verification
      if (currentPayment) {
        const paymentId = currentPayment.id || currentPayment.ID;
        if (!paymentId) {
          throw new Error("Payment ID not found");
        }
        await onCompleteRecharge(paymentId, paymentData);
      }

      toast.success("Wallet recharged successfully!");
      setAmount("");
      setShowRazorpayCheckout(false);
      setCurrentPayment(null);
      onRechargeSuccess?.();
      onClose();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete recharge"
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentFailure = (error: unknown) => {
    let errorMessage = "Payment failed. Please try again.";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "description" in error
    ) {
      errorMessage = (error as { description: string }).description;
    }

    toast.error(errorMessage);
    setShowRazorpayCheckout(false);
    setCurrentPayment(null);
  };

  const handlePaymentClose = () => {
    setShowRazorpayCheckout(false);
    setCurrentPayment(null);
  };


  return (
    <>
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
                        Recharge Wallet
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        Add money to your wallet for seamless payments
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 overflow-y-auto max-h-[60vh] py-2">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Amount Input */}
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Amount (₹)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium"
                          min="1"
                          max="50000"
                          step="0.01"
                          required
                          disabled={isLoading || isProcessingPayment}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={
                          isLoading ||
                          isProcessingPayment ||
                          !amount ||
                          parseFloat(amount) <= 0
                        }
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {isLoading || isProcessingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Wallet className="w-4 h-4" />
                            <span>Pay with Razorpay</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Terms and Conditions */}
                    <p className="text-xs text-gray-500 text-center pt-2">
                      By proceeding, you agree to our{" "}
                      <a
                        href="#"
                        className="underline text-green-600 cursor-pointer"
                      >
                        T&C
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="underline text-green-600 cursor-pointer"
                      >
                        Privacy policy
                      </a>
                      .
                    </p>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Razorpay Checkout */}
      {showRazorpayCheckout && currentPayment && (
        <RazorpayCheckout
          order={{
            id: currentPayment.razorpay_order_id,
            amount: currentPayment.amount * 100, // Convert to paise
            currency: currentPayment.currency,
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          }}
          description="Wallet Recharge"
          onSuccess={handlePaymentSuccess}
          onFailure={async (error) => {
            // Check if it's an order-related error (expired order)
            if (
              error instanceof Error &&
              (error.message.includes("order") ||
                error.message.includes("expired") ||
                error.message.includes("timeout"))
            ) {
              if (currentPayment && onRefreshOrder) {
                try {
                  const paymentId = currentPayment.id || currentPayment.ID;
                  if (!paymentId) {
                    throw new Error("Payment ID not found");
                  }

                  // Try to refresh the order
                  const response = await onRefreshOrder(paymentId);

                  // Update current payment with new order details
                  setCurrentPayment({
                    ...currentPayment,
                    razorpay_order_id: response.payment.razorpay_order_id,
                  });

                  // Show success message and keep checkout open
                  toast.success("Payment order refreshed. Please try again.");
                  return; // Don't close checkout, let user try again
                } catch {
                  toast.error(
                    "Failed to refresh payment order. Please try creating a new recharge."
                  );
                }
              } else {
                toast.error("Order expired. Please try again.");
              }
            }

            handlePaymentFailure(error);
          }}
          onClose={handlePaymentClose}
        />
      )}
    </>
  );
}
