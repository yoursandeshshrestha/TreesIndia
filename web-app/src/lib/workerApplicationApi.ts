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
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

export const workerApplicationApi = {
  // Submit worker application
  submitWorkerApplication: async (
    applicationData: WorkerApplicationRequest
  ): Promise<WorkerApplicationResponse> => {
    // Compress files to reduce upload size
    const filesToCompress: { [key: string]: File } = {
      aadhar_card: applicationData.aadhar_card,
      pan_card: applicationData.pan_card,
      profile_pic: applicationData.profile_pic,
      police_verification: applicationData.police_verification,
    };

    const compressedFiles = await compressFiles(filesToCompress);

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

    // Add compressed documents
    formData.append("aadhar_card", compressedFiles.aadhar_card);
    formData.append("pan_card", compressedFiles.pan_card);
    formData.append("profile_pic", compressedFiles.profile_pic);
    formData.append("police_verification", compressedFiles.police_verification);

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
