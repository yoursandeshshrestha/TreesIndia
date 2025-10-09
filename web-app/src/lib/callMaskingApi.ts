import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

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

export interface CloudShopeCallRequest {
  from_number: string;
  mobile_number: string;
}

export interface CloudShopeCallResponse {
  status: number;
  message: string;
  data: {
    mobile: string;
  };
}

export const callMaskingApi = {
  // Initiate a call
  initiateCall: async (bookingId: number): Promise<void> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/call-masking/call`,
      {
        method: "POST",
        body: JSON.stringify({ booking_id: bookingId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get call logs for a booking
  getCallLogs: async (bookingId: number): Promise<CallLog[]> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/call-masking/logs/${bookingId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Get call masking status for a booking
  getCallMaskingStatus: async (
    bookingId: number
  ): Promise<CallMaskingStatus> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/call-masking/status/${bookingId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Make a test call (for development)
  testCall: async (phoneNumber: string): Promise<TestCallResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/call-masking/test?phone_number=${phoneNumber}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Initiate a call for a specific booking
  initiateCallForBooking: async (
    bookingId: number
  ): Promise<CloudShopeCallResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/call-masking/booking/call`,
      {
        method: "POST",
        body: JSON.stringify({ booking_id: bookingId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Initiate a CloudShope call
  initiateCloudShopeCall: async (
    request: CloudShopeCallRequest
  ): Promise<CloudShopeCallResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/call-masking/cloudshope/call`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  },
};
