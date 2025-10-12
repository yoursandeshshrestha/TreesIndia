"use client";
// Cache bust: RechargeWalletModal moved to WalletSection - v2

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { WalletSectionSkeleton } from "./WalletSectionSkeleton";
import { useWallet } from "@/hooks/useWallet";
import { WalletTransaction } from "@/lib/walletApi";
import { formatDateTime } from "@/utils/dateTimeUtils";
import RazorpayCheckout from "@/commonComponents/razorpay/RazorpayCheckout";

export function WalletSection() {
  const [isClient, setIsClient] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Modal state
  const [amount, setAmount] = useState("");
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<{
    id: string;
    amount: number;
    currency: string;
    key_id: string;
  } | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Debug logging (remove in production)
  // console.log("WalletSection rendered", { showRechargeModal, showRazorpayCheckout });

  const {
    walletSummary,
    transactions,
    isLoadingWalletSummary,
    isLoadingTransactions,
    createRechargeAsync,
    completeRechargeAsync,
    isCreatingRecharge,
    isCompletingRecharge,
  } = useWallet(true); // Enable transactions fetching for wallet page

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRecharge = useCallback(() => {
    setShowRechargeModal(true);
  }, []);

  const getTransactionStatus = (transaction: WalletTransaction) => {
    if (transaction.status === "pending") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse"></div>
          Pending
        </span>
      );
    } else if (transaction.status === "completed") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></div>
          Completed
        </span>
      );
    } else if (transaction.status === "failed") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></div>
          Failed
        </span>
      );
    }
    return null;
  };

  const getTransactionIcon = (type: string) => {
    if (type === "wallet_recharge" || type === "credit") {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    } else {
      return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "wallet_recharge":
        return "Wallet Recharge";
      case "wallet_debit":
        return "Service Payment";
      case "refund":
        return "Refund";
      case "admin_adjustment":
        return "Admin Adjustment";
      default:
        return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  // Modal handler functions - memoized to prevent unnecessary re-renders
  const handleModalSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const rechargeAmount = parseFloat(amount);

      if (rechargeAmount < 1) {
        toast.error("Minimum recharge amount is ₹1");
        return;
      }

      if (rechargeAmount > 10000) {
        toast.error("Maximum recharge amount is ₹10,000");
        return;
      }

      setIsProcessingPayment(true);

      try {
        // Create wallet recharge
        const response = await createRechargeAsync({
          amount: rechargeAmount,
          payment_method: "razorpay",
        });

        if (response.data.payment && response.data.payment_order) {
          const payment = response.data.payment;
          const paymentOrder = response.data.payment_order;

          // Set up Razorpay order
          const order = {
            id: payment.razorpay_order_id,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            key_id: paymentOrder.key_id,
          };

          setRazorpayOrder(order);
          setCurrentPaymentId(payment.id || payment.ID || 0);
          setShowRazorpayCheckout(true);
        } else {
          toast.error("Failed to create payment order. Please try again.");
        }
      } catch (error) {
        console.error("Error creating wallet recharge:", error);
        toast.error("Failed to initiate wallet recharge. Please try again.");
      } finally {
        setIsProcessingPayment(false);
      }
    },
    [amount, createRechargeAsync]
  );

  const handleRazorpaySuccess = useCallback(
    async (paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      console.log("Razorpay success callback triggered with:", paymentData);

      if (!currentPaymentId) {
        console.error("No current payment ID found");
        toast.error("Payment verification failed. Please try again.");
        return;
      }

      try {
        setIsProcessingPayment(true);
        setShowRazorpayCheckout(false);

        console.log(
          "Completing wallet recharge for payment ID:",
          currentPaymentId
        );
        await completeRechargeAsync({
          paymentId: currentPaymentId,
          paymentData,
        });

        console.log("Wallet recharge completed successfully");

        // Clean up Razorpay state first
        setRazorpayOrder(null);
        setCurrentPaymentId(null);
        setIsProcessingPayment(false);

        // Show success message and close modal
        toast.success("Wallet recharged successfully!");
        setAmount("");
        setShowRechargeModal(false);

        // Force scroll restoration
        setTimeout(() => {
          document.body.style.overflow = "unset";
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.width = "";
          document.body.style.height = "";
          document.documentElement.style.overflow = "";
          window.scrollTo(0, 0);
        }, 100);
      } catch (error) {
        console.error("Error completing wallet recharge:", error);
        toast.error("Payment verification failed. Please contact support.");

        // Clean up on error
        setShowRazorpayCheckout(false);
        setRazorpayOrder(null);
        setCurrentPaymentId(null);
        setIsProcessingPayment(false);
      }
    },
    [currentPaymentId, completeRechargeAsync]
  );

  const handleRazorpayFailure = useCallback((error?: unknown) => {
    console.error("Razorpay failure callback triggered:", error);
    toast.error("Payment failed. Please try again.");
    setShowRazorpayCheckout(false);
    setRazorpayOrder(null);
    setCurrentPaymentId(null);
    setIsProcessingPayment(false);

    // Force scroll restoration after Razorpay failure
    setTimeout(() => {
      document.body.style.overflow = "unset";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
    }, 200);
  }, []);

  const handleRazorpayClose = useCallback(() => {
    setShowRazorpayCheckout(false);
    setRazorpayOrder(null);
    setCurrentPaymentId(null);
    setIsProcessingPayment(false);

    // Force scroll restoration after Razorpay closes
    setTimeout(() => {
      document.body.style.overflow = "unset";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
    }, 200);
  }, []);

  const handleCloseModal = () => {
    setShowRechargeModal(false);
    setAmount("");
    setShowRazorpayCheckout(false);
    setRazorpayOrder(null);
    setCurrentPaymentId(null);
    setIsProcessingPayment(false);

    // Force scroll restoration
    setTimeout(() => {
      document.body.style.overflow = "unset";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
    }, 100);
  };

  // Cleanup effect when modal closes
  useEffect(() => {
    if (!showRechargeModal) {
      setShowRazorpayCheckout(false);
      setRazorpayOrder(null);
      setCurrentPaymentId(null);
      setIsProcessingPayment(false);
    }
  }, [showRechargeModal]);

  // Body scroll lock management
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (showRechargeModal || showRazorpayCheckout) {
      // Lock body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = originalStyle;
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [showRechargeModal, showRazorpayCheckout]);

  if (isLoadingWalletSummary) {
    return <WalletSectionSkeleton />;
  }

  return (
    <div className="space-y-6 ">
      <div className="">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                My Wallet
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your wallet balance and transactions
              </p>
            </div>
            <button
              onClick={handleRecharge}
              className="flex items-center gap-2 py-2 text-green-600 hover:text-green-700 cursor-pointer rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Recharge Wallet
            </button>
          </div>

          {/* Wallet Summary */}
          {walletSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ₹{walletSummary.current_balance.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">Total Recharged</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ₹{walletSummary.total_recharge.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ₹{walletSummary.total_spent.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h3>

        {isLoadingTransactions ? (
          <div className="divide-y divide-gray-200 ">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="py-3">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-gray-200 rounded mt-1 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No transactions found</p>
            <p className="text-sm text-gray-500 mt-1">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 ">
            {transactions.map((transaction, index) => (
              <div
                key={`transaction-${index}-${
                  transaction.id ||
                  transaction.created_at ||
                  transaction.CreatedAt ||
                  Date.now()
                }`}
                className="py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3 px-5">
                  <div className="mt-1">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>{transaction.description}</p>
                          <p className="text-xs mt-1">
                            {isClient
                              ? formatDateTime(
                                  transaction.created_at ||
                                    transaction.CreatedAt
                                )
                              : "Loading..."}
                            {transaction.balance_after && (
                              <span className="ml-2">
                                • Balance: ₹
                                {transaction.balance_after.toFixed(2)}
                              </span>
                            )}
                            {transaction.payment_reference && (
                              <span className="ml-2">
                                • Ref: {transaction.payment_reference}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="flex flex-col items-end gap-2">
                          <div
                            className={`text-lg font-semibold ${
                              transaction.type === "wallet_recharge" ||
                              transaction.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "wallet_recharge" ||
                            transaction.type === "credit"
                              ? "+"
                              : "-"}
                            ₹{transaction.amount.toFixed(2)}
                          </div>
                          {getTransactionStatus(transaction)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recharge Modal */}
      <AnimatePresence>
        {showRechargeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-4 overflow-y-auto "
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 1, y: 20 }}
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
                onClick={handleCloseModal}
                className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg "
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-black" />
              </motion.button>

              <motion.div
                className="bg-white rounded-2xl min-w-[300px] max-w-[500px] w-full max-h-[90vh] overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
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
                  <form onSubmit={handleModalSubmit} className="space-y-6">
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
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-lg font-medium ${
                            amount && parseFloat(amount) > 10000
                              ? "border-red-300 focus:ring-red-500 bg-red-50"
                              : "border-gray-300 focus:ring-green-500"
                          }`}
                          min="1"
                          max="10000"
                          step="0.01"
                          required
                          disabled={
                            isProcessingPayment ||
                            isCreatingRecharge ||
                            isCompletingRecharge
                          }
                        />
                      </div>
                      {/* Amount validation error */}
                      {amount && parseFloat(amount) > 10000 && (
                        <p className="text-red-500 text-sm mt-1">
                          Maximum recharge amount is ₹10,000
                        </p>
                      )}
                      {/* Amount limit hint */}
                      {!amount && (
                        <p className="text-gray-500 text-sm mt-1">
                          Enter amount between ₹1 - ₹10,000
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={
                          isProcessingPayment ||
                          isCreatingRecharge ||
                          isCompletingRecharge ||
                          !amount ||
                          parseFloat(amount) <= 0 ||
                          parseFloat(amount) > 10000
                        }
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {isProcessingPayment ||
                        isCreatingRecharge ||
                        isCompletingRecharge ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>
                              {isCreatingRecharge
                                ? "Creating order..."
                                : isCompletingRecharge
                                ? "Verifying payment..."
                                : "Processing..."}
                            </span>
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
      {showRazorpayCheckout && razorpayOrder && (
        <RazorpayCheckout
          key={razorpayOrder.id} // Use order ID as key to prevent re-mounting
          order={razorpayOrder}
          description="Wallet Recharge"
          onSuccess={handleRazorpaySuccess}
          onFailure={handleRazorpayFailure}
          onClose={handleRazorpayClose}
        />
      )}

      {/* Payment Verification Loading Overlay */}
      {isProcessingPayment && !showRazorpayCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-[#00a871]/10 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-[#00a871] animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  Verifying Payment
                </h3>
                <p className="text-gray-600 text-sm">
                  Please wait while we confirm your payment. This will only take
                  a moment...
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#00a871] rounded-full animate-[loading_1.5s_ease-in-out_infinite]"
                  style={{
                    width: "60%",
                    animation: "loading 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
            width: 0%;
          }
          50% {
            transform: translateX(0%);
            width: 100%;
          }
          100% {
            transform: translateX(100%);
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
