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
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/addresses`);

      if (!response.ok) {
        return [];
      }
      
      const rawData = await response.json();
      
      // Backend returns: { success: true, message: "...", data: [...] }
      let addresses: Address[] = [];
      
      // Extract data from response
      if (rawData && typeof rawData === 'object') {
        if (Array.isArray(rawData.data)) {
          addresses = rawData.data;
        } else if (Array.isArray(rawData)) {
          // handleResponse might have already extracted the array
          addresses = rawData;
        } else if (rawData.data === null || rawData.data === undefined) {
          // Backend returns { data: null } when no addresses exist
          addresses = [];
        }
      }
      
      // Ensure we have an array before mapping
      if (!Array.isArray(addresses)) {
        return [];
      }
      
      // Normalize the data and compute fullAddress
      // Backend returns snake_case: is_default, postal_code, house_number
      const normalized = addresses.map((addr: any) => {
        const normalizedAddr: Address = {
          id: addr.id,
          name: addr.name || '',
          address: addr.address || '',
          city: addr.city || '',
          state: addr.state || '',
          country: addr.country || 'India',
          postal_code: addr.postal_code || addr.postalCode || '',
          postalCode: addr.postal_code || addr.postalCode || '',
          latitude: addr.latitude || 0,
          longitude: addr.longitude || 0,
          house_number: addr.house_number || addr.houseNumber || '',
          houseNumber: addr.house_number || addr.houseNumber || '',
          landmark: addr.landmark || '',
          is_default: addr.is_default !== undefined ? addr.is_default : (addr.isDefault !== undefined ? addr.isDefault : false),
          isDefault: addr.is_default !== undefined ? addr.is_default : (addr.isDefault !== undefined ? addr.isDefault : false),
        };
        
        normalizedAddr.fullAddress = this.buildFullAddress(normalizedAddr);
        return normalizedAddr;
      });
      
      return normalized;
    } catch (error) {
      return [];
    }
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

