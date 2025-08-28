"use client";

import React, { useState, useRef, useEffect } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
  className?: string;
  onComplete?: (otp: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  length = 6,
  error,
  disabled = false,
  className = "",
  onComplete,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && !value) {
      inputRefs.current[0].focus();
    }
  }, [value]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow digits
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split("");
    newValue[index] = digit;
    const newOTP = newValue.join("").substring(0, length);

    onChange(newOTP);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when OTP is complete
    if (newOTP.length === length && onComplete) {
      onComplete(newOTP);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === "Backspace") {
      if (value[index]) {
        // Clear current digit
        const newValue = value.split("");
        newValue[index] = "";
        onChange(newValue.join(""));
      } else if (index > 0) {
        // Move to previous input
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData("text/plain");
    const digits = pastedData.replace(/\D/g, "").substring(0, length);

    if (digits.length === length) {
      onChange(digits);
      // Focus last input
      inputRefs.current[length - 1]?.focus();
      // Auto-submit when OTP is complete
      if (onComplete) {
        onComplete(digits);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex space-x-2">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            onPaste={handlePaste}
            disabled={disabled}
            className={`
              w-12 h-12 text-center text-lg font-semibold border rounded-lg
              transition-all duration-200 focus:outline-none
              ${
                error
                  ? "border-red-500 focus:border-red-500"
                  : focusedIndex === index
                  ? "border-gray-400"
                  : value[index]
                  ? "border-[#00a871]"
                  : "border-gray-300 focus:border-gray-400"
              }
              ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
            `}
          />
        ))}
      </div>

      {error && <p className="text-left text-sm text-red-600">{error}</p>}
    </div>
  );
};
