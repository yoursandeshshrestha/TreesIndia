import {
  BrokerApplicationRequest,
  BrokerApplicationResponse,
} from "@/types/broker-application";
import { authenticatedFetch } from "./auth-api";

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("API Error Response:", {
      status: response.status,
      statusText: response.statusText,
      errorData: errorData,
    });

    // Extract the specific error message from the backend response
    let errorMessage = `HTTP error! status: ${response.status}`;

    if (errorData.error) {
      // Backend returns error in 'error' field
      errorMessage = errorData.error;
    } else if (errorData.message) {
      // Backend returns error in 'message' field
      errorMessage = errorData.message;
    }

    throw new Error(errorMessage);
  }
  return response.json();
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const brokerApplicationApi = {
  // Submit broker application
  submitBrokerApplication: async (
    applicationData: BrokerApplicationRequest
  ): Promise<BrokerApplicationResponse> => {
    const formData = new FormData();

    // Add basic fields
    formData.append("license", applicationData.license);
    formData.append("agency", applicationData.agency);
    formData.append("contact_info", applicationData.contact_info);
    formData.append("address", applicationData.address);

    // Add files
    formData.append("aadhar_card", applicationData.aadhar_card);
    formData.append("pan_card", applicationData.pan_card);
    formData.append("profile_pic", applicationData.profile_pic);

    const response = await authenticatedFetch(
      `${API_BASE_URL}/role-applications/broker`,
      {
        method: "POST",
        body: formData,
      }
    );

    return handleApiResponse(response);
  },

  // Get user's current application
  getUserApplication: async (): Promise<BrokerApplicationResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/role-applications/me`
    );
    return handleApiResponse(response);
  },
};
