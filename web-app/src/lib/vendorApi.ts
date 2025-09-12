import {
  Vendor,
  VendorsResponse,
  UserVendorsResponse,
  VendorFilters,
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorStats,
} from "@/types/vendor";
import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function fetchVendors(
  filters: VendorFilters = {}
): Promise<VendorsResponse> {
  const searchParams = new URLSearchParams();

  // Add filters to search params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/public/vendors?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch vendors: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchVendorById(id: number): Promise<{
  success: boolean;
  message: string;
  data: Vendor;
  timestamp: string;
}> {
  const url = `${API_BASE_URL}/vendors/${id}`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch vendor: ${response.statusText}`);
  }

  return response.json();
}

export async function searchVendors(
  query: string,
  filters: VendorFilters = {}
): Promise<VendorsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append("q", query);

  // Add additional filters to search params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/public/vendors/search?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to search vendors: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchVendorsByBusinessType(
  businessType: string,
  filters: VendorFilters = {}
): Promise<VendorsResponse> {
  const searchParams = new URLSearchParams();

  // Add filters to search params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/public/vendors/type/${businessType}?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch vendors by business type: ${response.statusText}`
    );
  }

  return response.json();
}

export async function fetchUserVendors(
  page: number = 1,
  limit: number = 20
): Promise<UserVendorsResponse> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const url = `${API_BASE_URL}/vendors?${searchParams.toString()}`;

    const response = await authenticatedFetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Try to parse the error response to get the actual error message
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData === "object") {
          throw new Error(
            errorData.message || errorData.error || `HTTP error! status: ${response.status}`
          );
        }
      } catch (parseError) {
        // If parsing fails, fall back to status text
        throw new Error(`Failed to fetch user vendors: ${response.statusText}`);
      }
      throw new Error(`Failed to fetch user vendors: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching user vendors:", error);
    throw error;
  }
}

export async function createVendor(vendorData: CreateVendorRequest): Promise<{
  success: boolean;
  message: string;
  data: Vendor;
  timestamp: string;
}> {
  try {
    const url = `${API_BASE_URL}/vendors`;

    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add basic fields
    formData.append("vendor_name", vendorData.vendor_name);
    formData.append(
      "business_description",
      vendorData.business_description || ""
    );
    formData.append("contact_person_name", vendorData.contact_person_name);
    formData.append("contact_person_phone", vendorData.contact_person_phone);
    formData.append(
      "contact_person_email",
      vendorData.contact_person_email || ""
    );
    formData.append("business_type", vendorData.business_type);
    formData.append(
      "years_in_business",
      vendorData.years_in_business.toString()
    );

    // Add JSON fields as stringified JSON
    formData.append(
      "business_address",
      JSON.stringify(vendorData.business_address)
    );
    formData.append(
      "services_offered",
      JSON.stringify(vendorData.services_offered)
    );

    // Add profile picture if provided
    if (vendorData.profile_picture) {
      formData.append("profile_picture", vendorData.profile_picture);
    }

    // Add gallery images if provided
    if (vendorData.business_gallery && vendorData.business_gallery.length > 0) {
      vendorData.business_gallery.forEach((image) => {
        formData.append("business_gallery", image);
      });
    }

    const response = await authenticatedFetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      // If the response contains error details, throw them
      if (data && typeof data === "object") {
        throw new Error(
          data.message || data.error || `HTTP error! status: ${response.status}`
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error creating vendor:", error);
    throw error;
  }
}

export async function updateVendor(
  vendorId: number,
  vendorData: UpdateVendorRequest
): Promise<{
  success: boolean;
  message: string;
  data: Vendor;
  timestamp: string;
}> {
  try {
    const url = `${API_BASE_URL}/vendors/${vendorId}`;
    const response = await authenticatedFetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vendorData),
    });

    const data = await response.json();

    if (!response.ok) {
      // If the response contains error details, throw them
      if (data && typeof data === "object") {
        throw new Error(
          data.message || data.error || `HTTP error! status: ${response.status}`
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error updating vendor:", error);
    throw error;
  }
}

export async function deleteVendor(
  vendorId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${API_BASE_URL}/vendors/${vendorId}`;
    const response = await authenticatedFetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If the response contains error details, throw them
      if (data && typeof data === "object") {
        throw new Error(
          data.message || data.error || `HTTP error! status: ${response.status}`
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error deleting vendor:", error);
    throw error;
  }
}

export async function fetchVendorStats(): Promise<{
  success: boolean;
  message: string;
  data: VendorStats;
  timestamp: string;
}> {
  const url = `${API_BASE_URL}/vendors/stats`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch vendor stats: ${response.statusText}`);
  }

  return response.json();
}
