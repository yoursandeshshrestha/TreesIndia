"use client";

import { Wallet, CreditCard, Calendar, AlertCircle } from "lucide-react";
import { Booking } from "@/lib/bookingApi";
import {
  AvailableSlot,
  PaymentProgress,
  PaymentSegmentInfo,
} from "@/types/booking";
import { formatAmount } from "@/utils/formatters";
import { useQuoteAcceptanceRedux } from "@/hooks/useQuoteAcceptanceRedux";
import { formatTime12Hour } from "@/utils/dateTimeUtils";
import { PaymentProgress as PaymentProgressComponent } from "@/commonComponents/PaymentSegment";
import { usePaymentSegments } from "@/hooks/usePaymentSegments";

type PaymentMethod = "wallet" | "razorpay";

interface PaymentSectionProps {
  booking: Booking;
  selectedDate: string | null;
  selectedTimeSlot: AvailableSlot | null;
  selectedPaymentMethod: PaymentMethod | null;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  getAddressName: (
    address: string | Record<string, unknown> | null | undefined
  ) => string;
  getAddressDetails: (
    address: string | Record<string, unknown> | null | undefined
  ) => string;
  isMultipleSegments?: boolean;
}

export default function PaymentSection({
  booking,
  selectedDate,
  selectedTimeSlot,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  getAddressName,
  getAddressDetails,
  isMultipleSegments = false,
}: PaymentSectionProps) {
  // Get wallet data from Redux
  const { walletSummary, isWalletDisabled } = useQuoteAcceptanceRedux();

  // Fetch payment segments for this booking
  const { paymentProgress, isLoadingSegments } = usePaymentSegments(
    booking.ID || booking.id
  );

  // Check if this booking has payment segments
  const hasPaymentSegments =
    paymentProgress && paymentProgress.segments.length > 0;

  return (
    <div className="p-6 h-auto flex flex-col">
      {/* Full Booking Summary */}
      <h3 className="font-semibold text-gray-900 text-lg mb-4">
        Booking Summary
      </h3>
      <div className="space-y-4 mb-6">
        {/* Service */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Service</span>
          <span className="font-medium">{booking.service?.name}</span>
        </div>

        {/* Address */}
        <div className="flex justify-between items-start text-sm">
          <span className="text-gray-600">Address</span>
          <span className="font-medium text-right max-w-xs">
            <span className="text-gray-900 font-medium">
              {getAddressName(booking.address)}
            </span>{" "}
            - {getAddressDetails(booking.address)}
          </span>
        </div>

        {/* Date & Time - Only show for single segment bookings */}
        {!isMultipleSegments && selectedDate && selectedTimeSlot && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Date & Time</span>
            <span className="font-medium">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              at {formatTime12Hour(selectedTimeSlot.time as string)}
            </span>
          </div>
        )}

        {/* Multiple Segments Info */}
        {isMultipleSegments && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Service Type</span>
            <span className="font-medium">
              To be scheduled after first payment
            </span>
          </div>
        )}

        {/* Quote Amount */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {isMultipleSegments ? "First Payment" : "Quote Amount"}
          </span>
          <span className="font-medium">
            {isMultipleSegments &&
            paymentProgress &&
            paymentProgress.segments.length > 0
              ? formatAmount(paymentProgress.segments[0].amount)
              : formatAmount(booking.quote_amount || 0)}
          </span>
        </div>

        {/* Payment Segments Info */}
        {isLoadingSegments ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span className="text-sm text-gray-600">
                Loading payment segments...
              </span>
            </div>
          </div>
        ) : hasPaymentSegments && paymentProgress ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Payment Segments Available
              </span>
            </div>
            <div className="text-xs text-blue-700">
              This quote has been split into {paymentProgress.total_segments}{" "}
              payment segments. You can pay them individually or all at once.
            </div>
          </div>
        ) : null}

        {/* Total */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-semibold">
              {isMultipleSegments
                ? "Pay Now"
                : hasPaymentSegments
                ? "Total Quote Amount"
                : "Payable Amount"}
            </span>
            <span className="text-gray-900 font-semibold text-lg">
              {isMultipleSegments &&
              paymentProgress &&
              paymentProgress.segments.length > 0
                ? formatAmount(paymentProgress.segments[0].amount)
                : formatAmount(booking.quote_amount || 0)}
            </span>
          </div>
          {isMultipleSegments && paymentProgress && (
            <div className="text-sm text-gray-600 mt-1">
              Total Quote: {formatAmount(booking.quote_amount || 0)} •
              Remaining:{" "}
              {formatAmount(
                paymentProgress.remaining_amount -
                  paymentProgress.segments[0].amount
              )}
            </div>
          )}
          {!isMultipleSegments && hasPaymentSegments && paymentProgress && (
            <div className="text-sm text-gray-600 mt-1">
              Remaining: {formatAmount(paymentProgress.remaining_amount)}
            </div>
          )}
        </div>
      </div>

      {/* Payment Method Selection */}
      <h3 className="font-semibold text-gray-900 text-lg mb-4">
        {isMultipleSegments ? "Pay First Segment" : "Select Payment Method"}
      </h3>
      <div className="space-y-3 flex-1">
        {/* Wallet Payment Option */}
        <button
          onClick={() => onPaymentMethodSelect("wallet")}
          disabled={isWalletDisabled}
          className={`w-full p-4 rounded-lg border transition-all text-left ${
            selectedPaymentMethod === "wallet"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          } ${isWalletDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  Pay with Wallet
                </p>
                <p className="text-xs text-gray-600">
                  Balance: {formatAmount(walletSummary?.current_balance || 0)}
                  {isWalletDisabled && (
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

        {/* Razorpay Payment Option */}
        <button
          onClick={() => onPaymentMethodSelect("razorpay")}
          className={`w-full p-4 rounded-lg border transition-all text-left ${
            selectedPaymentMethod === "razorpay"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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

      {/* Payment Segments Section */}
      {hasPaymentSegments && paymentProgress && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 text-lg mb-4">
            Payment Segments
          </h3>
          <PaymentProgressComponent
            progress={paymentProgress}
            showSegments={true}
            className="border-0 shadow-none"
          />
        </div>
      )}
    </div>
  );
}
