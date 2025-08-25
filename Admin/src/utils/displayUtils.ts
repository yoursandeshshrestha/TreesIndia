/**
 * Utility functions for consistent display of null/undefined values in the admin interface
 */

/**
 * Returns "Not Provided" for null/undefined values, otherwise returns the original value
 */
export const displayValue = (
  value: string | number | null | undefined,
  fallback: string = "Not Provided"
): string => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
};

/**
 * Returns "Not Provided" for null/undefined values, otherwise returns the original value
 * For boolean values, returns "Yes" or "No"
 */
export const displayBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) {
    return "Not Provided";
  }
  return value ? "Yes" : "No";
};

/**
 * Formats a date string, returns "Not Provided" if null/undefined
 */
export const displayDate = (
  dateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateString) {
    return "Not Provided";
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  try {
    return new Date(dateString).toLocaleDateString(
      "en-IN",
      options || defaultOptions
    );
  } catch (error) {
    return "Invalid Date";
  }
};

/**
 * Formats a time string, returns "Not Provided" if null/undefined
 */
export const displayTime = (timeString: string | null | undefined): string => {
  if (!timeString) {
    return "Not Provided";
  }

  try {
    return new Date(timeString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Time";
  }
};

/**
 * Formats a date and time string, returns "Not Provided" if null/undefined
 */
export const displayDateTime = (
  dateTimeString: string | null | undefined
): string => {
  if (!dateTimeString) {
    return "Not Provided";
  }

  try {
    return new Date(dateTimeString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Date/Time";
  }
};

/**
 * Formats currency, returns "Not Provided" if null/undefined
 */
export const displayCurrency = (
  amount: number | null | undefined,
  currency: string = "INR"
): string => {
  if (amount === null || amount === undefined) {
    return "Not Provided";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Formats duration, returns "Not Provided" if null/undefined
 */
export const displayDuration = (
  duration: string | null | undefined
): string => {
  if (!duration) {
    return "Not Provided";
  }
  return duration;
};

/**
 * Capitalizes and formats status strings, returns "Not Provided" if null/undefined
 */
export const displayStatus = (status: string | null | undefined): string => {
  if (!status) {
    return "Not Provided";
  }
  return status.replace("_", " ").toUpperCase();
};
