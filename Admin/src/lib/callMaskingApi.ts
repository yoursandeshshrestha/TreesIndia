import { apiClient } from "./api-client";

export interface CallMaskingStatus {
  available: boolean;
}

export interface CallLog {
  id: number;
  caller_id: number;
  caller_name: string;
  call_duration: number;
  call_status: "ringing" | "completed" | "failed" | "missed";
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface InitiateCallRequest {
  booking_id: number;
}

export interface TestCallResponse {
  call_sid: string;
  message: string;
}

export const callMaskingApi = {
  // Initiate a call
  initiateCall: async (bookingId: number): Promise<void> => {
    const response = await apiClient.post("/call-masking/call", {
      booking_id: bookingId,
    });
    return response.data;
  },

  // Get call logs for a booking
  getCallLogs: async (bookingId: number): Promise<CallLog[]> => {
    const response = await apiClient.get(`/call-masking/logs/${bookingId}`);
    return response.data.data;
  },

  // Get call masking status for a booking
  getCallMaskingStatus: async (
    bookingId: number
  ): Promise<CallMaskingStatus> => {
    const response = await apiClient.get(`/call-masking/status/${bookingId}`);
    return response.data.data;
  },

  // Make a test call (for development)
  testCall: async (phoneNumber: string): Promise<TestCallResponse> => {
    const response = await apiClient.post(
      `/call-masking/test?phone_number=${phoneNumber}`
    );
    return response.data.data;
  },
};
