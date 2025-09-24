import { useState } from "react";
import { toast } from "sonner";
import { callMaskingApi, CloudShopeCallResponse } from "@/lib/callMaskingApi";

interface UseBookingCallMaskingReturn {
  initiateCallForBooking: (
    bookingId: number
  ) => Promise<CloudShopeCallResponse | null>;
  isCalling: boolean;
  callStatus: string | null;
}

export function useBookingCallMasking(): UseBookingCallMaskingReturn {
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);

  const initiateCallForBooking = async (
    bookingId: number
  ): Promise<CloudShopeCallResponse | null> => {
    if (isCalling) {
      toast.error("A call is already in progress");
      return null;
    }

    setIsCalling(true);
    setCallStatus("Initiating call...");

    try {
      const response = await callMaskingApi.initiateCallForBooking(bookingId);

      if (response.status === 200) {
        setCallStatus("Call initiated successfully");
        toast.success("Call initiated successfully!");

        // Show masked number to user
        toast.success(
          `Call connected! You can now call: ${response.data.mobile}`,
          {
            duration: 5000,
          }
        );

        return response;
      } else {
        throw new Error(response.message || "Failed to initiate call");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initiate call";
      setCallStatus("Call failed");
      toast.error(errorMessage);
      console.error("Call initiation failed:", error);
      return null;
    } finally {
      setIsCalling(false);
      // Clear status after a delay
      setTimeout(() => setCallStatus(null), 3000);
    }
  };

  return {
    initiateCallForBooking,
    isCalling,
    callStatus,
  };
}





