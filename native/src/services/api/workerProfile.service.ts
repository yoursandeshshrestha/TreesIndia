import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export interface ContactInfo {
  alternative_number: string;
}

export interface BankingInfo {
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  account_holder_name: string;
}

export interface Documents {
  aadhar_card: string;
  pan_card: string;
  profile_pic: string;
  police_verification: string;
}

export interface WorkerProfile {
  id: number;
  user_id: number;
  worker_type: 'normal' | 'treesindia_worker';
  name: string;
  email: string;
  phone: string;
  alternative_number: string;
  profile_pic: string;
  contact_info: ContactInfo;
  address: Address;
  skills: string[];
  experience_years: number;
  banking_info: BankingInfo;
  documents: Documents;
  is_active: boolean;
  is_available: boolean;
  rating: number;
  total_bookings: number;
  total_jobs: number;
  earnings: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateWorkerProfileRequest {
  contact_info: {
    alternative_number: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    lat?: number;
    lng?: number;
  };
  skills: string[];
  experience_years: number;
  banking_info: {
    account_number: string;
    ifsc_code: string;
    bank_name: string;
    account_holder_name: string;
  };
}

class WorkerProfileService {
  async getWorkerProfile(): Promise<WorkerProfile> {
    const response = await authenticatedFetch(`${API_BASE_URL}/workers/profile`);
    const data = await handleResponse<WorkerProfile>(response);
    return data;
  }

  async updateWorkerProfile(data: UpdateWorkerProfileRequest): Promise<WorkerProfile> {
    const response = await authenticatedFetch(`${API_BASE_URL}/workers/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const responseData = await handleResponse<WorkerProfile>(response);
    return responseData;
  }
}

export const workerProfileService = new WorkerProfileService();
