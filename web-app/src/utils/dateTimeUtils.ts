/**
 * Utility functions for date and time formatting
 */

/**
 * Formats a time string from 24-hour format to 12-hour format with AM/PM
 * @param timeString - Time string in HH:MM format
 * @returns Formatted time string in 12-hour format
 */
export const formatTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    return timeString;
  }
};

/**
 * Formats a date and time combination into a readable string
 * @param dateString - Date string in ISO format
 * @param timeString - Time string in HH:MM format
 * @returns Formatted date and time string
 */
export const formatDateAndTime = (dateString: string, timeString: string): string => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = formatTime(timeString);

  return `${formattedDate} - ${formattedTime}`;
};
