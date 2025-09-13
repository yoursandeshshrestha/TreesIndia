/**
 * Utility functions for consistent display formatting in the web-app
 */

/**
 * Formats a date and time string in chat format: "01:09 PM | 9 Mar"
 */
export const displayChatDateTime = (
  dateTimeString: string | null | undefined
): string => {
  if (!dateTimeString) {
    return "Not Provided";
  }

  try {
    const date = new Date(dateTimeString);
    const time = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const dateStr = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    return `${time} | ${dateStr}`;
  } catch (error) {
    console.error("Error formatting chat date/time:", error);
    return "Invalid Date/Time";
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
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid Time";
  }
};
