"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useQuoteAcceptanceRedux } from "@/hooks/useQuoteAcceptanceRedux";
import BookingDetailsCard from "./BookingDetailsCard";
import DateTimeSelection from "./DateTimeSelection";
import PaymentSection from "./PaymentSection";
import SimpleSummary from "./SimpleSummary";

export function QuoteAcceptanceContent() {
  const {
    booking,
    currentStep,
    selectedDate,
    selectedTimeSlot,
    selectedPaymentMethod,
    isLoadingSlots,
    dateOptions,
    availableSlots,
    bookingConfigData,
    handleDateSelect,
    handleTimeSlotSelect,
    handlePaymentMethodSelect,
    handleSetCurrentStep,
    getAddressName,
    getAddressDetails,
  } = useQuoteAcceptanceRedux();

  // Get payment segments directly from booking object (new structure)
  const paymentSegments = booking?.payment_segments || [];

  const hasMultipleSegments = paymentSegments.length > 1;

  // Auto-set currentStep to "payment" for multiple segments (skip date/time selection)
  useEffect(() => {
    if (hasMultipleSegments && currentStep === "date") {
      handleSetCurrentStep("payment");
    }
  }, [hasMultipleSegments, currentStep, handleSetCurrentStep]);

  if (!booking) return null;

  return (
    <div className="flex h-full">
      {/* Left Side - Main Content */}
      <div className="w-1/3 overflow-y-auto border-r border-gray-200">
        <BookingDetailsCard
          booking={booking}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          currentStep={currentStep}
          getAddressName={getAddressName}
          getAddressDetails={getAddressDetails}
          hasMultipleSegments={hasMultipleSegments}
        />

        {/* Processing State */}
        {currentStep === "processing" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            <span className="ml-3 text-gray-600">Processing payment...</span>
          </div>
        )}
      </div>

      {/* Right Side - Summary or Date/Time Selection */}
      <div className="w-2/3 overflow-y-auto">
        {hasMultipleSegments ? (
          // For multiple segments, skip date/time selection and go directly to payment
          <PaymentSection
            booking={booking}
            selectedDate={null} // No date selection for multiple segments
            selectedTimeSlot={null} // No time selection for multiple segments
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            getAddressName={getAddressName}
            getAddressDetails={getAddressDetails}
            isMultipleSegments={true}
          />
        ) : currentStep === "date" || currentStep === "time" ? (
          // For single segment or no segments, show date/time selection
          <DateTimeSelection
            currentStep={currentStep}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            availableSlots={availableSlots}
            bookingConfig={bookingConfigData?.data || null}
            isLoading={isLoadingSlots}
            onDateSelect={handleDateSelect}
            onTimeSlotSelect={handleTimeSlotSelect}
            dateOptions={dateOptions}
          />
        ) : currentStep === "payment" ? (
          <PaymentSection
            booking={booking}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            getAddressName={getAddressName}
            getAddressDetails={getAddressDetails}
            isMultipleSegments={false}
          />
        ) : (
          <SimpleSummary booking={booking} />
        )}
      </div>
    </div>
  );
}
