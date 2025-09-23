"use client";

import React, { useState } from "react";
import { Phone, PhoneCall, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCallMasking } from "@/hooks/useCallMasking";

interface CallMaskingButtonProps {
  fromNumber: string;
  toNumber: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  showLabel?: boolean;
}

export function CallMaskingButton({
  fromNumber,
  toNumber,
  disabled = false,
  className = "",
  size = "md",
  variant = "default",
  showLabel = false,
}: CallMaskingButtonProps) {
  const { initiateCall, isCalling, callStatus } = useCallMasking();
  const [showCallModal, setShowCallModal] = useState(false);

  const handleCallClick = async () => {
    if (!fromNumber || !toNumber) {
      toast.error("Phone numbers are required to initiate a call");
      return;
    }

    if (disabled) {
      toast.error("Calling is not available at the moment");
      return;
    }

    // Show confirmation modal for call
    setShowCallModal(true);
  };

  const confirmCall = async () => {
    setShowCallModal(false);

    const request = {
      from_number: fromNumber,
      mobile_number: toNumber,
    };

    await initiateCall(request);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "p-1.5 text-sm";
      case "lg":
        return "p-3 text-lg";
      default:
        return "p-2 text-base";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "outline":
        return "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50";
      case "ghost":
        return "bg-transparent text-gray-600 hover:bg-gray-100";
      default:
        return "bg-blue-600 text-white hover:bg-blue-700";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-6 h-6";
      default:
        return "w-5 h-5";
    }
  };

  return (
    <>
      <button
        onClick={handleCallClick}
        disabled={disabled || isCalling}
        className={`
          inline-flex items-center gap-2 rounded-lg transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${className}
        `}
        title={isCalling ? callStatus || "Calling..." : "Call"}
      >
        {isCalling ? (
          <Loader2 className={`${getIconSize()} animate-spin`} />
        ) : (
          <Phone className={getIconSize()} />
        )}
        {showLabel && (
          <span className="font-medium">
            {isCalling ? "Calling..." : "Call"}
          </span>
        )}
      </button>

      {/* Call Confirmation Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <PhoneCall className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Initiate Call
                </h3>
                <p className="text-sm text-gray-600">
                  This will connect you through a masked number
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{fromNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{toNumber}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCallModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCall}
                disabled={isCalling}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isCalling ? "Connecting..." : "Call Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

