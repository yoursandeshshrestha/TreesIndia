import { DateOption } from "@/components/SlotModal/SlotModal.types";

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
