"use client";

import { useState } from "react";
import {
  Wallet,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  apiService,
  WalletTransaction,
  WalletSummary,
  RazorpayOrder,
} from "../../lib/api";
import RazorpayCheckout from "../../components/RazorpayCheckout";

export default function WalletTest() {
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "token" | "recharge" | "payment" | "success" | "error"
  >("token");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(
    null
  );
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [razorpayOrder, setRazorpayOrder] = useState<RazorpayOrder | null>(
    null
  );
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);
  const [completingPaymentId, setCompletingPaymentId] = useState<number | null>(
    null
  );

  const handleTokenSubmit = () => {
    if (token.trim()) {
      apiService.setAuthToken(token);
      setCurrentStep("recharge");
      loadWalletData();
    }
  };

  const loadWalletData = async () => {
    setIsLoadingWallet(true);
    setError("");

    try {
      // Load wallet summary
      const summary = await apiService.getWalletSummary();
      setWalletSummary(summary);

      // Load recent transactions
      const txns = await apiService.getWalletTransactions();
      setTransactions(txns);
    } catch (error: any) {
      console.error("Failed to load wallet data:", error);
      // Set default values if API fails
      setWalletSummary({
        current_balance: 0,
        total_recharge: 0,
        total_spent: 0,
        total_transactions: 0,
      });
      setTransactions([]);
      setError(
        "Failed to load wallet data. Please check your connection and try again."
      );
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleRecharge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.createWalletRecharge({
        amount: parseFloat(amount),
        payment_method: "razorpay",
      });

      setRazorpayOrder(response.payment_order);
      setCurrentPayment(response.payment);
      setCurrentStep("payment");
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to create recharge request"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    setIsLoading(true);
    setError("");

    try {
      const paymentId = currentPayment?.ID || currentPayment?.id;

      if (!paymentId) {
        throw new Error("Payment ID not found");
      }

      await apiService.completeWalletRecharge(paymentId, paymentData);
      setSuccess("Wallet recharged successfully!");
      setCurrentStep("success");
      loadWalletData(); // Refresh wallet data
    } catch (error: any) {
      console.error("Error completing wallet recharge:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to complete recharge"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentFailure = (error: any) => {
    setError("Payment failed: " + (error.description || "Unknown error"));
    setCurrentStep("error");
  };

  const handlePaymentClose = () => {
    setShowRazorpayCheckout(false);
    setCurrentStep("recharge");
  };

  const handleCompletePendingPayment = async (payment: WalletTransaction) => {
    setCompletingPaymentId(payment.id || payment.ID || 0);
    setError("");

    try {
      // Check if we have the Razorpay order ID
      if (!payment.razorpay_order_id) {
        throw new Error(
          "Payment order not found. Please try creating a new recharge."
        );
      }

      // Create Razorpay order object from the payment
      const razorpayOrder: RazorpayOrder = {
        id: payment.razorpay_order_id,
        amount: payment.amount * 100, // Convert to paise
        currency: "INR",
        receipt: payment.payment_reference || payment.reference_id || "",
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", // From environment config
      };

      // Set the current payment and order
      setCurrentPayment(payment);
      setRazorpayOrder(razorpayOrder);
      setAmount(payment.amount.toString());

      // Open Razorpay checkout
      setShowRazorpayCheckout(true);
      setCurrentStep("payment");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to open payment gateway"
      );
    } finally {
      setCompletingPaymentId(null);
    }
  };

  const resetFlow = () => {
    setToken("");
    setAmount("");
    setCurrentStep("token");
    setError("");
    setSuccess("");
    setRazorpayOrder(null);
    setCurrentPayment(null);
    setWalletSummary(null);
    setTransactions([]);
    setShowRazorpayCheckout(false);
    setCompletingPaymentId(null);
  };

  const renderTokenStep = () => (
    <div className="max-w-md w-full mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Wallet Recharge Test
          </h1>
          <p className="text-gray-600">Test wallet recharge with Razorpay</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JWT Token
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your JWT token here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <button
            onClick={handleTokenSubmit}
            disabled={!token.trim()}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Start Wallet Test
          </button>
        </div>
      </div>
    </div>
  );

  const renderRechargeStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Wallet Recharge</h1>
          <button
            onClick={resetFlow}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Wallet Summary
            </h2>
            {walletSummary ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance:</span>
                  <span className="font-semibold text-green-600">
                    ₹{(walletSummary.current_balance || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Recharged:</span>
                  <span className="font-semibold">
                    ₹{(walletSummary.total_recharge || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spent:</span>
                  <span className="font-semibold">
                    ₹{(walletSummary.total_spent || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-semibold">
                    {walletSummary.total_transactions || 0}
                  </span>
                </div>
              </div>
            ) : isLoadingWallet ? (
              <div className="text-gray-500">Loading wallet data...</div>
            ) : (
              <div className="text-center">
                <div className="text-gray-500 mb-2">
                  Failed to load wallet data
                </div>
                <button
                  onClick={loadWalletData}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Recharge Form */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recharge Amount
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleRecharge}
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Recharge with Razorpay
                  </>
                )}
              </button>

              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700 text-sm">{success}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((txn) => (
                  <div
                    key={txn.id || txn.ID}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {txn.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(txn.created_at).toLocaleDateString()} -{" "}
                        {txn.type || txn.transaction_type}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Ref: {txn.payment_reference || txn.reference_id}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div
                        className={`font-semibold ${
                          txn.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {txn.amount > 0 ? "+" : ""}₹{txn.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {txn.status}
                      </div>

                      {/* Pay Now Button for Pending Transactions */}
                      {txn.status === "pending" && (
                        <div className="text-center">
                          <button
                            onClick={() => handleCompletePendingPayment(txn)}
                            disabled={
                              completingPaymentId === (txn.id || txn.ID)
                            }
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            {completingPaymentId === (txn.id || txn.ID) ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                            ) : (
                              "Pay Now"
                            )}
                          </button>
                          <div className="text-xs text-gray-500 mt-1">
                            Complete payment via Razorpay
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No transactions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="max-w-md w-full mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Payment
          </h1>
          <p className="text-gray-600">Amount: ₹{amount}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono">{razorpayOrder?.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>₹{(razorpayOrder?.amount || 0) / 100}</span>
              </div>
              <div className="flex justify-between">
                <span>Currency:</span>
                <span>{razorpayOrder?.currency}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Click the button below to open Razorpay payment gateway
            </p>
            <button
              onClick={() => {
                setShowRazorpayCheckout(true);
              }}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Pay with Razorpay
            </button>
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-md w-full mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">Your wallet has been recharged</p>
        </div>

        <div className="space-y-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              Transaction Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-semibold">₹{amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-600">Completed</span>
              </div>
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-mono text-xs">
                  {currentPayment?.payment_reference ||
                    currentPayment?.reference_id}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={resetFlow}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Start New Test
          </button>
        </div>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="max-w-md w-full mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600">Something went wrong</p>
        </div>

        <div className="space-y-6">
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>

          <button
            onClick={resetFlow}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === "token" && renderTokenStep()}
      {currentStep === "recharge" && renderRechargeStep()}
      {currentStep === "payment" && renderPaymentStep()}
      {currentStep === "success" && renderSuccessStep()}
      {currentStep === "error" && renderErrorStep()}

      {/* Razorpay Checkout */}
      {showRazorpayCheckout && razorpayOrder && (
        <RazorpayCheckout
          order={razorpayOrder}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
}
