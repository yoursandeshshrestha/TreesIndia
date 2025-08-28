"use client";

import React from "react";
import { useBookingConfig } from "@/hooks/useBookingConfig";

interface PriceSummaryProps {
  service?: {
    id: number;
    name: string;
    description: string;
    price: number | null;
    price_type: "fixed" | "inquiry";
    duration: string | null;
    images: string[] | null;
  };
  isInquiryService?: boolean;
}

export function PriceSummary({ service, isInquiryService }: PriceSummaryProps) {
  const { config, isLoading, error } = useBookingConfig();

  // Calculate fees based on service type
  const itemTotal = service?.price || 0;

  // Get inquiry booking fee from backend config, show error if not available
  const inquiryFee = config?.inquiry_booking_fee
    ? parseInt(config.inquiry_booking_fee)
    : 0;
  const visitationFee = isInquiryService ? inquiryFee : 0; // Inquiry services have a booking fee
  const taxesAndFees = 0; // Taxes and fees set to 0 for now
  const totalAmount = itemTotal + visitationFee + taxesAndFees;

  // Show error if config failed to load for inquiry services
  if (isInquiryService && error) {
    return (
      <div className="w-80 bg-white h-fit border border-gray-200 p-4 mt-6 rounded-lg sticky top-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment summary
        </h3>
        <div className="text-red-600 text-sm">
          Failed to load booking configuration. Please refresh the page.
        </div>
      </div>
    );
  }

  // Show loading state
  if (isInquiryService && isLoading) {
    return (
      <div className="w-80 bg-white h-fit border border-gray-200 p-4 mt-6 rounded-lg sticky top-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment summary
        </h3>
        <div className="text-gray-600 text-sm">
          Loading booking configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white h-fit border border-gray-200 p-4 mt-6 rounded-lg sticky top-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Payment summary
      </h3>

      <div className="space-y-3">
        {/* Item Total */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Item total</span>
          <span className="font-medium">₹{itemTotal}</span>
        </div>

        {/* Visitation Fee (only for inquiry services) */}
        {isInquiryService && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Inquiry Fee</span>
            <span className="font-medium">₹{visitationFee}</span>
          </div>
        )}

        {/* Taxes and Fees */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Taxes and Fee</span>
          <span className="font-medium">₹{taxesAndFees}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-3"></div>

        {/* Total Amount */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-900 font-medium">Total amount</span>
          <span className="text-gray-900 font-medium">₹{totalAmount}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-3"></div>

        {/* Amount to Pay */}
        <div className="flex justify-between items-center">
          <span className="text-gray-900 font-semibold">Amount to pay</span>
          <span className="text-gray-900 font-semibold text-lg">
            ₹{totalAmount}
          </span>
        </div>
      </div>
    </div>
  );
}
