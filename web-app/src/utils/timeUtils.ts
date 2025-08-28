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
  } catch (error) {
    console.error("Error formatting time:", error);
    return time; // Return original if there's an error
  }
}
