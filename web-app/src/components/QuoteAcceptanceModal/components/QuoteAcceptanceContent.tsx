"use client";

import { Loader2 } from "lucide-react";
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
    isLoading,
    isLoadingSlots,
    dateOptions,
    availableSlots,
    bookingConfigData,
    handleDateSelect,
    handleTimeSlotSelect,
    handlePaymentMethodSelect,
    getAddressName,
    getAddressDetails,
  } = useQuoteAcceptanceRedux();

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
          onSelectSlot={() => {
            /* Handle slot selection */
          }}
          getAddressName={getAddressName}
          getAddressDetails={getAddressDetails}
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
        {currentStep === "date" || currentStep === "time" ? (
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
          />
        ) : (
          <SimpleSummary booking={booking} />
        )}
      </div>
    </div>
  );
}
