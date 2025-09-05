"use client";

import React, { useState, useEffect } from "react";
import { Clock, Loader2 } from "lucide-react";

interface OTPTimerProps {
  duration: number; // in seconds
  onExpire?: () => void;
  onResend?: () => void;
  className?: string;
  isLoading?: boolean;
}

export const OTPTimer: React.FC<OTPTimerProps> = ({
  duration,
  onExpire,
  onResend,
  className = "",
  isLoading = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleResend = () => {
    if (onResend) {
      setTimeLeft(duration);
      setIsExpired(false);
      onResend();
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {!isExpired ? (
        <>
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{formatTime(timeLeft)}</span>
        </>
      ) : (
        <button
          onClick={handleResend}
          disabled={isLoading}
          className="text-sm text-[#006845] hover:text-[#006845]/80 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Resending...</span>
            </>
          ) : (
            <span>Resend code</span>
          )}
        </button>
      )}
    </div>
  );
};
