import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export interface BrokerAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface BrokerContactInfo {
  alternative_number: string;
}

export interface BrokerDocuments {
  aadhar_card: string;
  pan_card: string;
  profile_pic: string;
}

export interface BrokerProfile {
  id: number;
  user_id: number;
  contact_info: BrokerContactInfo;
  address: BrokerAddress;
  documents: BrokerDocuments;
  license: string;
  agency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateBrokerProfileRequest {
  contact_info: {
    alternative_number: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  license: string;
  agency: string;
}

class BrokerProfileService {
  async getBrokerProfile(): Promise<BrokerProfile> {
    const response = await authenticatedFetch(`${API_BASE_URL}/brokers/profile`);
    const data = await handleResponse<BrokerProfile>(response);
    return data;
  }

  async updateBrokerProfile(data: UpdateBrokerProfileRequest): Promise<BrokerProfile> {
    const response = await authenticatedFetch(`${API_BASE_URL}/brokers/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const responseData = await handleResponse<BrokerProfile>(response);
    return responseData;
  }
}

export const brokerProfileService = new BrokerProfileService();
