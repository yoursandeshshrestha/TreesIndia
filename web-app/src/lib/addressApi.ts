import { Address, AddressResponse } from "@/types/booking";
import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Address API functions
export async function fetchUserAddresses(): Promise<AddressResponse> {
  try {
    const url = `${API_BASE_URL}/addresses`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    throw error;
  }
}

export async function createAddress(addressData: {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  house_number?: string;
  is_default?: boolean;
}): Promise<{ success: boolean; message: string; data: Address }> {
  try {
    const url = `${API_BASE_URL}/addresses`;
    const response = await authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
}

export async function updateAddress(
  addressId: number,
  addressData: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    landmark?: string;
    house_number?: string;
    is_default?: boolean;
  }
): Promise<{ success: boolean; message: string; data: Address }> {
  try {
    const url = `${API_BASE_URL}/addresses/${addressId}`;
    const response = await authenticatedFetch(url, {
      method: "PUT",
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
}

export async function deleteAddress(
  addressId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${API_BASE_URL}/addresses/${addressId}`;
    const response = await authenticatedFetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
}

export async function setDefaultAddress(
  addressId: number
): Promise<{ success: boolean; message: string; data: Address }> {
  try {
    const url = `${API_BASE_URL}/addresses/${addressId}/set-default`;
    const response = await authenticatedFetch(url, {
      method: "PATCH",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
}

export async function getDefaultAddress(): Promise<{
  success: boolean;
  message: string;
  data: Address | null;
}> {
  try {
    const url = `${API_BASE_URL}/addresses/default`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      // Handle 404 (no default address) and 500 (server error) gracefully
      if (response.status === 404) {
        return {
          success: true,
          message: "No default address found",
          data: null,
        };
      }

      if (response.status === 500) {
        console.warn("Server error fetching default address, returning null");
        return {
          success: true,
          message: "Unable to fetch default address",
          data: null,
        };
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching default address:", error);
    // Return a graceful fallback instead of throwing
    return {
      success: true,
      message: "Unable to fetch default address",
      data: null,
    };
  }
}
