import {
  WorkerApplicationRequest,
  WorkerApplicationResponse,
} from "@/types/worker-application";
import { authenticatedFetch } from "./auth-api";
import { compressFiles } from "./imageCompression";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

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

export const workerApplicationApi = {
  // Submit worker application
  submitWorkerApplication: async (
    applicationData: WorkerApplicationRequest
  ): Promise<WorkerApplicationResponse> => {
    const formData = new FormData();

    // Add basic fields
    formData.append(
      "experience_years",
      applicationData.experience_years.toString()
    );
    formData.append("skills", applicationData.skills);
    formData.append("contact_info", applicationData.contact_info);
    formData.append("address", applicationData.address);
    formData.append("banking_info", applicationData.banking_info);

    // Add files directly (temporarily removing compression for debugging)
    formData.append("aadhar_card", applicationData.aadhar_card);
    formData.append("pan_card", applicationData.pan_card);
    formData.append("profile_pic", applicationData.profile_pic);
    formData.append("police_verification", applicationData.police_verification);

    const response = await authenticatedFetch(
      `${API_BASE_URL}/role-applications/worker`,
      {
        method: "POST",
        body: formData,
        // Don't set Content-Type for FormData, let the browser set it automatically
      }
    );

    return handleApiResponse(response);
  },

  // Get user's current application
  getUserApplication: async (): Promise<WorkerApplicationResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/role-applications/me`
    );
    return handleApiResponse(response);
  },
};
