"use client";

import React, { useState } from "react";
import { CreditCard, Wallet, AlertCircle, CheckCircle } from "lucide-react";
import {
  PaymentSegmentInfo,
  CreateSegmentPaymentRequest,
} from "@/types/booking";
import { formatAmount } from "@/utils/formatters";
import { paySegment } from "@/lib/bookingApi";

interface PaymentSegmentManagerProps {
  bookingId: number;
  segments: PaymentSegmentInfo[];
  onPaymentSuccess?: (segmentId: number) => void;
  onPaymentError?: (error: string) => void;
  walletBalance?: number;
}

type PaymentMethod = "wallet" | "razorpay";

export default function PaymentSegmentManager({
  bookingId,
  segments,
  onPaymentSuccess,
  onPaymentError,
  walletBalance = 0,
}: PaymentSegmentManagerProps) {
  const [selectedSegment, setSelectedSegment] =
    useState<PaymentSegmentInfo | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingSegments = segments.filter((s) => s.status === "pending");
  const paidSegments = segments.filter((s) => s.status === "paid");
  const overdueSegments = segments.filter((s) => s.status === "overdue");

  const handleSegmentSelect = (segment: PaymentSegmentInfo) => {
    if (segment.status === "pending" || segment.status === "overdue") {
      setSelectedSegment(segment);
      setSelectedPaymentMethod(null);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaySegment = async () => {
    if (!selectedSegment || !selectedPaymentMethod) return;

    setIsProcessing(true);
    try {
      const paymentData: CreateSegmentPaymentRequest = {
        segment_number: selectedSegment.segment_number,
        amount: selectedSegment.amount,
      };

      const result = await paySegment(bookingId, paymentData);

      if (result.success) {
        onPaymentSuccess?.(selectedSegment.id);
        setSelectedSegment(null);
        setSelectedPaymentMethod(null);
      } else {
        onPaymentError?.("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      onPaymentError?.("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const canPayWithWallet = (amount: number) => {
    return walletBalance >= amount;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Segments List */}
      <div className="space-y-3">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedSegment?.id === segment.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            } ${segment.status === "paid" ? "opacity-75 cursor-default" : ""}`}
            onClick={() => handleSegmentSelect(segment)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(segment.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      Segment #{segment.segment_number}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        segment.status
                      )}`}
                    >
                      {segment.status}
                    </span>
                  </div>
                  {segment.due_date && (
                    <div className="text-sm text-gray-600">
                      Due:{" "}
                      {new Date(segment.due_date).toLocaleDateString("en-IN")}
                    </div>
                  )}
                  {segment.notes && (
                    <div className="text-sm text-gray-600 mt-1">
                      {segment.notes}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatAmount(segment.amount)}
                </div>
                {segment.status === "paid" && segment.paid_at && (
                  <div className="text-sm text-green-600">
                    Paid on{" "}
                    {new Date(segment.paid_at).toLocaleDateString("en-IN")}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Method Selection */}
      {selectedSegment &&
        (selectedSegment.status === "pending" ||
          selectedSegment.status === "overdue") && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Pay Segment #{selectedSegment.segment_number} -{" "}
              {formatAmount(selectedSegment.amount)}
            </h4>

            <div className="space-y-3 mb-4">
              {/* Wallet Payment */}
              <button
                onClick={() => handlePaymentMethodSelect("wallet")}
                disabled={!canPayWithWallet(selectedSegment.amount)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedPaymentMethod === "wallet"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                } ${
                  !canPayWithWallet(selectedSegment.amount)
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
                        Balance: {formatAmount(walletBalance)}
                        {!canPayWithWallet(selectedSegment.amount) && (
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
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? "Processing..."
                  : `Pay ${formatAmount(selectedSegment.amount)}`}
              </button>
            )}
          </div>
        )}

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {pendingSegments.length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {paidSegments.length}
            </div>
            <div className="text-sm text-gray-600">Paid</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">
              {overdueSegments.length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  );
}
