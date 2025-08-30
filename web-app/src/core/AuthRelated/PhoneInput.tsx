"use client";

import React, { useRef, useEffect } from "react";
import { CountryCodeDropdown } from "./CountryCodeDropdown";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  onBlur?: () => void;
  onEnter?: () => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  onBlur,
  onEnter,
  error,
  disabled = false,
  placeholder = "Enter your phone number",
  className = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Format phone number as user types (remove country code from input)
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    let cleaned = input.replace(/\D/g, "");

    // Limit to 10 digits for Indian numbers
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }

    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter) {
      onEnter();
    }
  };

  const handleFocus = () => {
    // Focus handler if needed
  };

  const handleBlur = () => {
    onBlur?.();
  };

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current && !value) {
      inputRef.current.focus();
    }
  }, [value]);

  const isValidPhone = value.length === 10;

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        <CountryCodeDropdown
          value={countryCode}
          onChange={onCountryCodeChange}
          disabled={disabled}
        />
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="tel"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            className={`
              w-full pl-4 pr-4 py-3 text-black border border-l-0 border-gray-300 rounded-r-lg text-sm transition-all duration-200
              focus:outline-none focus:border-gray-400
              ${
                error
                  ? "border-red-500 focus:border-red-500"
                  : isValidPhone
                  ? "border-[#00a871] focus:border-[#00a871]"
                  : "border-gray-300"
              }
              ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
            `}
          />
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
