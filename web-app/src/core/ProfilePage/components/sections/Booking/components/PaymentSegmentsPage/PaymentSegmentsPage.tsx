"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { Booking, PaymentProgress } from "@/types/booking";
import {
  PaymentProgress as PaymentProgressComponent,
  PaymentSegmentManager,
} from "@/commonComponents/PaymentSegment";
import { formatAmount } from "@/utils/formatters";
import { usePaymentSegments } from "@/hooks/usePaymentSegments";

interface PaymentSegmentsPageProps {
  booking: Booking;
  onBack: () => void;
  onPaymentSuccess?: () => void;
}

export default function PaymentSegmentsPage({
  booking,
  onBack,
  onPaymentSuccess,
}: PaymentSegmentsPageProps) {
  const { paymentProgress, isLoadingSegments, segmentsError, refetchSegments } =
    usePaymentSegments(booking.ID || booking.id);

  const loading = isLoadingSegments;
  const error = segmentsError ? "Failed to load payment segments" : null;

  const handlePaymentSuccess = (segmentId: number) => {
    // Refresh the payment segments after successful payment
    refetchSegments();
    onPaymentSuccess?.();
  };

  const handlePaymentError = (error: string) => {
    // Error is handled by the hook
    console.error("Payment error:", error);
  };

  const handleRefresh = () => {
    refetchSegments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading payment segments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!paymentProgress) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No payment segments found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Payment Segments
            </h2>
            <p className="text-sm text-gray-600">
              Booking #{booking.booking_reference} - {booking.service?.name}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Payment Progress Overview */}
      <div className="mb-6">
        <PaymentProgressComponent
          progress={paymentProgress}
          showSegments={false}
        />
      </div>

      {/* Payment Segments Manager */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Manage Payment Segments
        </h3>
        <PaymentSegmentManager
          bookingId={booking.ID || booking.id || 0}
          segments={paymentProgress.segments}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          walletBalance={booking.user?.wallet_balance || 0}
        />
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Payment Information</p>
            <ul className="space-y-1 text-blue-700">
              <li>• You can pay segments individually or all at once</li>
              <li>• Overdue segments are highlighted in red</li>
              <li>
                • Payment confirmation will be sent to your registered email
              </li>
              <li>• All payments are processed securely through Razorpay</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
