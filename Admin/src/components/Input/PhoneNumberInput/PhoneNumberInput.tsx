import React, { useState, useRef, useEffect } from "react";
import { Phone, Plus, X, Search } from "lucide-react";
import type {
  PhoneNumberInputProps,
  PhoneNumber,
  CountryCode,
} from "./PhoneNumberInput.types";

// Default country codes
const DEFAULT_COUNTRY_CODES: CountryCode[] = [
  { code: "NP", dialCode: "+977", name: "Nepal", flag: "🇳🇵" },
  { code: "IN", dialCode: "+91", name: "India", flag: "🇮🇳" },
  { code: "US", dialCode: "+1", name: "United States", flag: "🇺🇸" },
  { code: "GB", dialCode: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", dialCode: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "AU", dialCode: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "DE", dialCode: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dialCode: "+33", name: "France", flag: "🇫🇷" },
  { code: "JP", dialCode: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "CN", dialCode: "+86", name: "China", flag: "🇨🇳" },
  { code: "BR", dialCode: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", dialCode: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "IT", dialCode: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "ES", dialCode: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "NL", dialCode: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", dialCode: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", dialCode: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "DK", dialCode: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", dialCode: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "CH", dialCode: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", dialCode: "+43", name: "Austria", flag: "🇦🇹" },
];

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  error,
  fullWidth = true,
  className = "",
  value,
  onChange,
  placeholder = "Enter phone number",
  required = false,
  disabled = false,
  maxPhoneNumbers = 5,
  countryCodes = DEFAULT_COUNTRY_CODES,
  showFlags = true,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleAddPhoneNumber = () => {
    if (value.length < maxPhoneNumbers) {
      const newPhoneNumber: PhoneNumber = {
        id: `phone-${Date.now()}-${Math.random()}`,
        countryCode: "+1", // Default to US
        phoneNumber: "",
      };
      onChange([...value, newPhoneNumber]);
    }
  };

  const handleRemovePhoneNumber = (id: string) => {
    // Don't allow removing the last phone number if required
    if (required && value.length === 1) {
      return;
    }
    onChange(value.filter((phone) => phone.id !== id));
  };

  const handlePhoneNumberChange = (
    id: string,
    field: "countryCode" | "phoneNumber",
    newValue: string
  ) => {
    onChange(
      value.map((phone) =>
        phone.id === id ? { ...phone, [field]: newValue } : phone
      )
    );
  };

  const handleCountryCodeChange = (id: string, countryCode: string) => {
    handlePhoneNumberChange(id, "countryCode", countryCode);
    setOpenDropdownId(null);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format based on length
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneInputChange = (id: string, inputValue: string) => {
    // Remove formatting and non-digits
    const digits = inputValue.replace(/\D/g, "");

    // Limit to 10 digits
    if (digits.length <= 10) {
      const formatted = formatPhoneNumber(digits);
      handlePhoneNumberChange(id, "phoneNumber", formatted);
    }
  };

  // Helper function to check if a phone number is valid
  const isPhoneNumberValid = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/\D/g, "");
    return digits.length >= 7;
  };

  // Filter countries based on search term
  const filteredCountries = countryCodes.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search when dropdown closes
  useEffect(() => {
    if (!openDropdownId) {
      setSearchTerm("");
    }
  }, [openDropdownId]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (openDropdownId && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [openDropdownId]);

  const baseClasses =
    "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm";
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";
  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";
  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {value.map((phone) => (
          <div key={phone.id} className="flex items-center gap-2">
            {/* Country Code Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdownId(
                    openDropdownId === phone.id ? null : phone.id
                  )
                }
                disabled={disabled}
                className={`${baseClasses} ${errorClasses} ${disabledClasses} min-w-[120px] h-[42px] flex items-center justify-between ${
                  disabled ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-2">
                  {showFlags && (
                    <span className="text-lg">
                      {countryCodes.find(
                        (c) => c.dialCode === phone.countryCode
                      )?.flag || "🌍"}
                    </span>
                  )}
                  <span className="text-sm font-medium">
                    {phone.countryCode}
                  </span>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openDropdownId === phone.id && (
                <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search countries or codes..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Country List */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() =>
                            handleCountryCodeChange(phone.id, country.dialCode)
                          }
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3"
                        >
                          {showFlags && (
                            <span className="text-lg">{country.flag}</span>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {country.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {country.dialCode}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Phone Number Input */}
            <div className="flex-1 relative">
              <input
                type="tel"
                value={phone.phoneNumber}
                onChange={(e) =>
                  handlePhoneInputChange(phone.id, e.target.value)
                }
                placeholder={placeholder}
                disabled={disabled}
                className={`${baseClasses} ${errorClasses} ${disabledClasses} ${widthClasses} h-[42px] pl-10 ${
                  phone.phoneNumber && !isPhoneNumberValid(phone.phoneNumber)
                    ? "border-red-300 focus:ring-red-500"
                    : ""
                }`}
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {phone.phoneNumber && !isPhoneNumberValid(phone.phoneNumber) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-xs text-red-500">Invalid</span>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemovePhoneNumber(phone.id)}
              disabled={disabled || (required && value.length === 1)}
              className={`p-2 text-gray-400 hover:text-red-500 transition-colors ${
                disabled || (required && value.length === 1)
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add Phone Number Button */}
        {value.length < maxPhoneNumbers && (
          <button
            type="button"
            onClick={handleAddPhoneNumber}
            disabled={disabled}
            className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm ${
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Phone Number
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PhoneNumberInput;
