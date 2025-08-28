/**
 * Utility functions for date formatting
 */

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
  } catch (error) {
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
  if (typeof window === 'undefined') {
    return "Loading...";
  }

  return formatDate(dateString, options);
};

/**
 * Formats a date for display without time
 * @param dateString - Date string
 * @returns Formatted date string
 */
export const formatDateOnly = (dateString: string | null | undefined): string => {
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
export const formatDateTime = (dateString: string | null | undefined): string => {
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
export const formatRelativeTime = (dateString: string | null | undefined): string => {
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
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return formatDateOnly(dateString);
    }
  } catch (error) {
    return "Invalid Date";
  }
};
