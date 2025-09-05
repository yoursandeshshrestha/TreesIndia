import { AvailableSlot } from "@/types/booking";

export interface DateOption {
  date: string;
  day: string;
  dayNumber: string;
  isAvailable: boolean;
}

export interface SlotSelection {
  date: string;
  timeSlot: AvailableSlot;
}

export interface SlotModalState {
  selectedDate: string | null;
  selectedTimeSlot: AvailableSlot | null;
  availableSlots: AvailableSlot[];
  isLoading: boolean;
}
