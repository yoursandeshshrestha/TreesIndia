/**
 * Consolidated utility functions for date and time formatting
 * This file combines all date/time utilities from timeUtils.ts, dateUtils.ts, and slotUtils.ts
 */

export interface DateOption {
  date: string; // Date in ISO format (e.g., "2024-01-15")
  day: string; // Day abbreviation (e.g., "Mon", "Tue")
  dayNumber: string; // Day number as string (e.g., "15")
  isAvailable: boolean; // Whether this date is available for booking
}

// ============================================================================
// TIME FORMATTING FUNCTIONS
// ============================================================================

/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 * @param time - Time in 24-hour format (e.g., "14:30", "09:00")
 * @returns Time in 12-hour format with AM/PM (e.g., "2:30 PM", "9:00 AM")
 */
export function formatTime12Hour(time: string): string {
  if (!time) return "";

  try {
    // Parse the time string (assuming format like "14:30" or "09:00")
    const [hours, minutes] = time.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      return time; // Return original if parsing fails
    }

    // Create a Date object to use built-in formatting
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    // Format to 12-hour time with AM/PM
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    console.error("Error formatting time");
    return time; // Return original if there's an error
  }
}

/**
 * Formats a time string from 24-hour format to 12-hour format with AM/PM
 * @param timeString - Time string in HH:MM format
 * @returns Formatted time string in 12-hour format with AM/PM
 */
export const formatTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
};

// ============================================================================
// DATE FORMATTING FUNCTIONS
// ============================================================================

/**
 * Safely formats a date string, handling various formats including ISO with timezone
 * @param dateString - Date string in various formats
 * @param options - Date formatting options
 * @returns Formatted date string or "Invalid Date" if parsing fails
 */
export const formatDate = (
  dateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateString) {
    return "N/A";
  }

  try {
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    };

    return date.toLocaleDateString("en-IN", options || defaultOptions);
  } catch {
    return "Invalid Date";
  }
};

/**
 * Client-side only date formatting to prevent hydration issues
 * @param dateString - Date string
 * @param options - Date formatting options
 * @returns Formatted date string or "Loading..." if on server
 */
export const formatDateClient = (
  dateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (typeof window === "undefined") {
    return "Loading...";
  }

  return formatDate(dateString, options);
};

/**
 * Formats a date for display without time
 * @param dateString - Date string
 * @returns Formatted date string
 */
export const formatDateOnly = (
  dateString: string | null | undefined
): string => {
  return formatDate(dateString, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

/**
 * Formats a date and time for display
 * @param dateString - Date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  dateString: string | null | undefined
): string => {
  return formatDate(dateString, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formats a relative time (e.g., "2 hours ago", "3 days ago")
 * @param dateString - Date string
 * @returns Relative time string
 */
export const formatRelativeTime = (
  dateString: string | null | undefined
): string => {
  if (!dateString) {
    return "N/A";
  }

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else {
      return formatDateOnly(dateString);
    }
  } catch {
    return "Invalid Date";
  }
};

// ============================================================================
// COMBINED DATE AND TIME FUNCTIONS
// ============================================================================

/**
 * Formats a date and time combination into a readable string
 * @param dateString - Date string in ISO format
 * @param timeString - Time string in HH:MM format
 * @returns Formatted date and time string
 */
export const formatDateAndTime = (
  dateString: string,
  timeString: string
): string => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = formatTime(timeString);

  return `${formattedDate} - ${formattedTime}`;
};

// ============================================================================
// BOOKING-SPECIFIC FUNCTIONS
// ============================================================================

export interface BookingConfig {
  working_hours_start: string;
  working_hours_end: string;
  booking_advance_days: string;
  booking_buffer_time_minutes: string;
}

/**
 * Generates date options for booking based on booking configuration
 * @param bookingConfig - The booking configuration containing advance days
 * @returns Array of DateOption objects
 */
export const generateDateOptions = (
  bookingConfig: BookingConfig | null
): DateOption[] => {
  const options: DateOption[] = [];
  const today = new Date();
  const advanceDays = bookingConfig
    ? parseInt(bookingConfig.booking_advance_days || "7")
    : 7;

  // Start from tomorrow (i = 1) as per test-flow logic
  for (let i = 1; i <= advanceDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = date.getDate().toString();
    const dateString = date.toISOString().split("T")[0];

    options.push({
      date: dateString,
      day,
      dayNumber,
      isAvailable: true, // You can add logic here to check availability
    });
  }

  return options;
};

// All functions are already exported inline above
