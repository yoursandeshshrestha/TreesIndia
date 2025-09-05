"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeSlotModal } from "@/store/slices/slotModalSlice";

import { AvailableSlot } from "@/types/booking";
import { bookingFlowApi } from "@/lib/bookingFlowApi";
import { toast } from "sonner";
import SlotSelectionModal from "./SlotSelectionModal";

export default function SlotModalManager() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.slotModal.isOpen);
  const { selectedService, selectedAddress } = useAppSelector(
    (state) => state.booking
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<AvailableSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setAvailableSlots([]);
    }
  }, [isOpen]);

  const handleClose = () => {
    dispatch(closeSlotModal());
  };

  const handleDateSelect = async (date: string) => {
    if (!selectedService || !selectedAddress) {
      toast.error("Please select a service and address first");
      return;
    }

    setSelectedDate(date);
    setIsLoading(true);

    try {
      const response = await bookingFlowApi.getAvailableSlots(
        selectedService.id,
        date
      );
      setAvailableSlots(response.data.available_slots || []);
    } catch {
      toast.error("Failed to load available time slots");
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSlotSelect = (timeSlot: AvailableSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleConfirmSelection = () => {
    if (selectedDate && selectedTimeSlot) {
      try {
        // Create action objects manually
        const dateAction = {
          type: "booking/setSelectedDate",
          payload: selectedDate,
        };
        const timeAction = {
          type: "booking/setSelectedTimeSlot",
          payload: selectedTimeSlot,
        };

        dispatch(dateAction);
        dispatch(timeAction);

        handleClose();
        toast.success("Date and time slot selected successfully");
      } catch {
        toast.error("Failed to save selection");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <SlotSelectionModal
      isOpen={isOpen}
      onClose={handleClose}
      selectedDate={selectedDate}
      selectedTimeSlot={selectedTimeSlot}
      availableSlots={availableSlots}
      isLoading={isLoading}
      onDateSelect={handleDateSelect}
      onTimeSlotSelect={handleTimeSlotSelect}
      onConfirm={handleConfirmSelection}
    />
  );
}
