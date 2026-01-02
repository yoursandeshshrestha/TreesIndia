import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export interface Address {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  postalCode?: string; // For compatibility
  latitude: number;
  longitude: number;
  house_number?: string;
  houseNumber?: string; // For compatibility
  landmark?: string;
  is_default: boolean;
  isDefault?: boolean; // For compatibility
  fullAddress?: string; // Computed field
}

export interface CreateAddressRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  house_number?: string;
  landmark?: string;
  is_default?: boolean;
}

export interface UpdateAddressRequest {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  house_number?: string;
  landmark?: string;
  is_default?: boolean;
}

class AddressService {
  async getAddresses(): Promise<Address[]> {
    const response = await authenticatedFetch(`${API_BASE_URL}/addresses`);
    const data = await handleResponse<any>(response);
    
    // Handle different response formats
    // Backend returns: { success: true, message: "...", data: [...] }
    // handleResponse extracts: data.data || data, so we should get the array
    // But handle edge cases where response might be different
    let addresses: Address[] = [];
    
    if (Array.isArray(data)) {
      addresses = data;
    } else if (data && typeof data === 'object') {
      // Try to extract array from various possible structures
      if (Array.isArray(data.addresses)) {
        addresses = data.addresses;
      } else if (Array.isArray(data.data)) {
        addresses = data.data;
      } else if (Array.isArray(data.items)) {
        addresses = data.items;
      } else if (data.data === null || data.data === undefined) {
        // Backend returns { data: null } when no addresses exist
        addresses = [];
      } else {
        // If it's an object but not an array, log and return empty
        console.warn('Unexpected address response format - expected array, got:', typeof data, data);
        addresses = [];
      }
    } else {
      // If data is not an array or object, return empty array
      console.warn('Unexpected address response format - not array or object:', typeof data, data);
      addresses = [];
    }
    
    // Ensure we have an array before mapping
    if (!Array.isArray(addresses)) {
      console.error('Addresses is not an array after processing:', addresses);
      return [];
    }
    
    // Normalize the data and compute fullAddress
    return addresses.map((addr) => ({
      ...addr,
      postalCode: addr.postal_code || addr.postalCode,
      houseNumber: addr.house_number || addr.houseNumber,
      isDefault: addr.is_default || addr.isDefault,
      fullAddress: this.buildFullAddress(addr),
    }));
  }

  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await authenticatedFetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        postal_code: data.postal_code,
        latitude: data.latitude || 0.0,
        longitude: data.longitude || 0.0,
        house_number: data.house_number || null,
        landmark: data.landmark || null,
        is_default: data.is_default || false,
      }),
    });
    const address = await handleResponse<Address>(response);
    return {
      ...address,
      postalCode: address.postal_code || address.postalCode,
      houseNumber: address.house_number || address.houseNumber,
      isDefault: address.is_default || address.isDefault,
      fullAddress: this.buildFullAddress(address),
    };
  }

  async updateAddress(data: UpdateAddressRequest): Promise<Address> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/addresses/${data.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country || 'India',
          postal_code: data.postal_code,
          latitude: data.latitude || 0.0,
          longitude: data.longitude || 0.0,
          house_number: data.house_number || null,
          landmark: data.landmark || null,
          is_default: data.is_default || false,
        }),
      }
    );
    const address = await handleResponse<Address>(response);
    return {
      ...address,
      postalCode: address.postal_code || address.postalCode,
      houseNumber: address.house_number || address.houseNumber,
      isDefault: address.is_default || address.isDefault,
      fullAddress: this.buildFullAddress(address),
    };
  }

  async deleteAddress(addressId: number): Promise<void> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/addresses/${addressId}`,
      {
        method: 'DELETE',
      }
    );
    return handleResponse<void>(response);
  }

  private buildFullAddress(address: Address): string {
    const parts: string[] = [];
    if (address.house_number || address.houseNumber) {
      parts.push(address.house_number || address.houseNumber || '');
    }
    if (address.address) {
      parts.push(address.address);
    }
    if (address.landmark) {
      parts.push(`Near ${address.landmark}`);
    }
    if (address.city) {
      parts.push(address.city);
    }
    if (address.state) {
      parts.push(address.state);
    }
    if (address.postal_code || address.postalCode) {
      parts.push(address.postal_code || address.postalCode || '');
    }
    return parts.join(', ');
  }
}

export const addressService = new AddressService();

