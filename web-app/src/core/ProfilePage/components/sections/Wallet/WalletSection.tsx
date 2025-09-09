"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { WalletSectionSkeleton } from "./WalletSectionSkeleton";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";
import { RechargeWalletModal } from "@/core/ProfilePage/components/sections/Wallet/WalletModal";
import RazorpayCheckout from "@/commonComponents/razorpay/RazorpayCheckout";
import { WalletTransaction } from "@/lib/walletApi";
import { formatDateTime } from "@/utils/dateTimeUtils";

// Payment data interface for Razorpay
interface PaymentData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Extended transaction interface for pending payments
interface PendingTransaction extends WalletTransaction {
  razorpay_order_id: string;
  currency: string;
}

export function WalletSection() {
  const [isClient, setIsClient] = useState(false);

  const {
    walletSummary,
    transactions,
    isLoadingWalletSummary,
    isLoadingTransactions,
    isCreatingRecharge,
    isCompletingRecharge,
    createRechargeAsync,
    completeRechargeAsync,
    refreshRechargeAsync,
    refetchWalletSummary,
    refetchTransactions,
  } = useWallet(true); // Enable transactions fetching for wallet page

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);
  const [currentPayment, setCurrentPayment] =
    useState<PendingTransaction | null>(null);

  const handleRefreshOrder = async (paymentId: number) => {
    const response = await refreshRechargeAsync(paymentId);
    return response.data;
  };

  const handleRecharge = async (amount: number) => {
    const response = await createRechargeAsync({
      amount,
      payment_method: "razorpay",
    });
    return response.data;
  };

  const handleCompleteRecharge = async (
    paymentId: number,
    paymentData: PaymentData
  ) => {
    await completeRechargeAsync({ paymentId, paymentData });
  };

  const handleRechargeSuccess = () => {
    refetchWalletSummary();
    refetchTransactions();
  };

  const handleCompletePendingPayment = (transaction: PendingTransaction) => {
    setCurrentPayment(transaction);
    setShowRazorpayCheckout(true);
  };

  const handlePaymentSuccess = async (paymentData: PaymentData) => {
    try {
      if (currentPayment) {
        const paymentId = currentPayment.id || currentPayment.ID;
        if (!paymentId) {
          throw new Error("Payment ID not found");
        }
        await completeRechargeAsync({
          paymentId,
          paymentData,
        });

        setShowRazorpayCheckout(false);
        setCurrentPayment(null);
        refetchWalletSummary();
        refetchTransactions();
      }
    } catch {}
  };

  const handlePaymentFailure = async (error: unknown) => {
    // Check if it's an order-related error (expired order)
    if (
      error instanceof Error &&
      (error.message.includes("order") ||
        error.message.includes("expired") ||
        error.message.includes("timeout"))
    ) {
      if (currentPayment) {
        try {
          const paymentId = currentPayment.id || currentPayment.ID;
          if (!paymentId) {
            throw new Error("Payment ID not found");
          }

          // Try to refresh the order
          const response = await refreshRechargeAsync(paymentId);

          // Update current payment with new order details
          setCurrentPayment({
            ...currentPayment,
            razorpay_order_id: response.data.payment.razorpay_order_id,
          });

          // Show success message and keep checkout open
          toast.success("Payment order refreshed. Please try again.");
          return; // Don't close checkout, let user try again
        } catch {
          toast.error(
            "Failed to refresh payment order. Please try creating a new recharge."
          );
        }
      }
    }

    setShowRazorpayCheckout(false);
    setCurrentPayment(null);
  };

  const handlePaymentClose = () => {
    setShowRazorpayCheckout(false);
    setCurrentPayment(null);
  };
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
              onClick={() => setShowRechargeModal(true)}
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

                        {/* Complete Payment Button for Pending Transactions */}
                        {transaction.status === "pending" &&
                          transaction.type === "wallet_recharge" && (
                            <div className="mt-2">
                              <button
                                onClick={() =>
                                  handleCompletePendingPayment(
                                    transaction as PendingTransaction
                                  )
                                }
                                disabled={isCompletingRecharge}
                                className="flex items-center text-[14px] gap-2 py-2 text-yellow-800 hover:text-red-700 cursor-pointer rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isCompletingRecharge ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4" />
                                    <span>Complete Payment</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
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
      <RechargeWalletModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onRechargeSuccess={handleRechargeSuccess}
        onRecharge={handleRecharge}
        onCompleteRecharge={handleCompleteRecharge}
        onRefreshOrder={handleRefreshOrder}
        isLoading={isCreatingRecharge}
      />

      {/* Razorpay Checkout for Pending Payments */}
      {showRazorpayCheckout && currentPayment && (
        <RazorpayCheckout
          order={{
            id: currentPayment.razorpay_order_id,
            amount: currentPayment.amount * 100, // Convert to paise
            currency: currentPayment.currency,
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          }}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
}
