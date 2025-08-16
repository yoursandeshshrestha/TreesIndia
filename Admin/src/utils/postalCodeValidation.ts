/**
 * Postal code validation utilities
 * Supports common postal code formats from different countries
 */

export interface PostalCodeValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates postal code based on country
 * @param postalCode - The postal code to validate
 * @param country - The country code (optional, defaults to generic validation)
 * @returns Validation result with error message if invalid
 */
export function validatePostalCode(
  postalCode: string,
  country?: string
): PostalCodeValidationResult {
  const trimmedCode = postalCode.trim();
  
  // If empty, it's valid (postal code is optional)
  if (!trimmedCode) {
    return { isValid: true };
  }

  // Country-specific validation patterns
  const patterns: Record<string, RegExp> = {
    // US ZIP codes: 12345 or 12345-6789
    US: /^\d{5}(-\d{4})?$/,
    // UK postcodes: A1A 1AA, A1 1AA, A11 1AA, AA1 1AA, AA11 1AA
    UK: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    // Canadian postal codes: A1A 1A1
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    // Indian PIN codes: 123456
    IN: /^\d{6}$/,
    // Australian postcodes: 1234
    AU: /^\d{4}$/,
    // German postal codes: 12345
    DE: /^\d{5}$/,
    // French postal codes: 12345
    FR: /^\d{5}$/,
    // Japanese postal codes: 123-4567
    JP: /^\d{3}-\d{4}$/,
    // Brazilian postal codes: 12345-678
    BR: /^\d{5}-\d{3}$/,
    // Mexican postal codes: 12345
    MX: /^\d{5}$/,
    // Russian postal codes: 123456
    RU: /^\d{6}$/,
    // Chinese postal codes: 123456
    CN: /^\d{6}$/,
    // South Korean postal codes: 123-456
    KR: /^\d{3}-\d{3}$/,
    // Thai postal codes: 12345
    TH: /^\d{5}$/,
    // Malaysian postal codes: 12345
    MY: /^\d{5}$/,
    // Singapore postal codes: 123456
    SG: /^\d{6}$/,
    // Indonesian postal codes: 12345
    ID: /^\d{5}$/,
    // Philippine postal codes: 1234
    PH: /^\d{4}$/,
    // Vietnamese postal codes: 123456
    VN: /^\d{6}$/,
    // Nepali postal codes: 12345
    NP: /^\d{5}$/,
  };

  // If country is specified and we have a pattern for it
  if (country && patterns[country.toUpperCase()]) {
    const pattern = patterns[country.toUpperCase()];
    if (!pattern.test(trimmedCode)) {
      return {
        isValid: false,
        error: `Invalid postal code format for ${country}. Please check the format.`,
      };
    }
  } else {
    // Generic validation for unspecified countries
    // Allow alphanumeric characters, spaces, and hyphens, 3-10 characters
    const genericPattern = /^[a-zA-Z0-9\s-]{3,10}$/;
    if (!genericPattern.test(trimmedCode)) {
      return {
        isValid: false,
        error: "Postal code must be 3-10 characters and contain only letters, numbers, spaces, and hyphens",
      };
    }
  }

  return { isValid: true };
}

/**
 * Gets postal code format hint for a specific country
 * @param country - The country code
 * @returns Format hint string
 */
export function getPostalCodeFormatHint(country?: string): string {
  const hints: Record<string, string> = {
    US: "Format: 12345 or 12345-6789",
    UK: "Format: A1A 1AA, A1 1AA, etc.",
    CA: "Format: A1A 1A1",
    IN: "Format: 123456 (6 digits)",
    AU: "Format: 1234 (4 digits)",
    DE: "Format: 12345 (5 digits)",
    FR: "Format: 12345 (5 digits)",
    JP: "Format: 123-4567",
    BR: "Format: 12345-678",
    MX: "Format: 12345 (5 digits)",
    RU: "Format: 123456 (6 digits)",
    CN: "Format: 123456 (6 digits)",
    KR: "Format: 123-456",
    TH: "Format: 12345 (5 digits)",
    MY: "Format: 12345 (5 digits)",
    SG: "Format: 123456 (6 digits)",
    ID: "Format: 12345 (5 digits)",
    PH: "Format: 1234 (4 digits)",
    VN: "Format: 123456 (6 digits)",
    NP: "Format: 12345 (5 digits)",
  };

  return hints[country?.toUpperCase() || ""] || "Format: 3-10 characters, letters, numbers, spaces, hyphens";
} 