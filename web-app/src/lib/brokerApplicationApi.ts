import {
  BrokerApplicationRequest,
  BrokerApplicationResponse,
} from "@/types/broker-application";
import { authenticatedFetch } from "./auth-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
      `${API_BASE_URL}/api/v1/role-applications/broker`,
      {
        method: "POST",
        body: formData,
      }
    );

    return response.json();
  },

  // Get user's current application
  getUserApplication: async (): Promise<BrokerApplicationResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/v1/role-applications/user`
    );
    return response.json();
  },
};
