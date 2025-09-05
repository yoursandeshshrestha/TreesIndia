"use client";

import { Loader2 } from "lucide-react";
import { useQuoteAcceptanceRedux } from "@/hooks/useQuoteAcceptanceRedux";
import { formatAmount } from "@/utils/formatters";

interface QuoteAcceptanceFooterProps {
  onClose: () => void;
}

export function QuoteAcceptanceFooter({ onClose }: QuoteAcceptanceFooterProps) {
  const {
    booking,
    currentStep,
    selectedPaymentMethod,
    isProcessing,
    isWalletDisabled,
    handleProceedToPayment,
  } = useQuoteAcceptanceRedux();

  if (!booking) return null;

  return (
    <div className="p-6 bg-white border-t border-gray-200">
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          Cancel
        </button>

        <div className="flex gap-3">
          {currentStep === "payment" && selectedPaymentMethod && (
            <button
              onClick={handleProceedToPayment}
              disabled={
                isProcessing ||
                (selectedPaymentMethod === "wallet" && isWalletDisabled)
              }
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                `Pay ${formatAmount(booking.quote_amount || 0)}`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
