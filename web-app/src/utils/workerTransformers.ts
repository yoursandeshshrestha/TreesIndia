import { Worker } from "@/types/worker";

/**
 * Raw worker data from API - JSON fields come as strings
 */
export interface RawWorker {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  user_id: number;
  role_application_id?: number;
  worker_type: "normal" | "treesindia_worker";

  // JSON fields as strings from API
  contact_info: string;
  address: string;
  banking_info: string;
  documents: string;
  skills: string;

  // Regular fields
  experience_years: number;
  is_available: boolean;
  rating: number;
  total_bookings: number;
  earnings: number;
  total_jobs: number;
  is_active: boolean;

  // User relationship
  user?: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
    email: string | null;
    phone: string;
    user_type: string;
    avatar: string;
    gender: string;
    is_active: boolean;
    last_login_at: string;
    role_application_status: string;
    application_date: string | null;
    approval_date: string | null;
    wallet_balance: number;
    subscription_id: number | null;
    subscription: any | null;
    has_active_subscription: boolean;
    subscription_expiry_date: string | null;
    notification_settings: Record<string, unknown> | null;
  };

  // Legacy fields for backward compatibility
  id?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Safely parse JSON string or return fallback value
 */
function safeJsonParse<T>(jsonString: string, fallback: T): T {
  if (!jsonString || typeof jsonString !== "string") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.warn("Failed to parse JSON:", jsonString, error);
    return fallback;
  }
}

/**
 * Transform raw worker data from API to properly typed Worker object
 */
export function transformWorkerData(rawWorker: RawWorker): Worker {
  return {
    ...rawWorker,
    contact_info: safeJsonParse(rawWorker.contact_info, {
      alternative_number: "",
      name: "",
      email: "",
      phone: "",
    }),
    address: safeJsonParse(rawWorker.address, {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    }),
    banking_info: safeJsonParse(rawWorker.banking_info, {
      account_number: "",
      ifsc_code: "",
      bank_name: "",
      account_holder_name: "",
    }),
    documents: safeJsonParse(rawWorker.documents, {
      aadhar_card: "",
      pan_card: "",
      profile_pic: "",
      police_verification: "",
    }),
    skills: safeJsonParse(rawWorker.skills, []),
  };
}

/**
 * Transform array of raw workers
 */
export function transformWorkersData(rawWorkers: RawWorker[]): Worker[] {
  return rawWorkers.map(transformWorkerData);
}

/**
 * Utility to parse skills from either string or array
 */
export function parseSkills(skills: string | string[]): string[] {
  if (Array.isArray(skills)) {
    return skills;
  }
  if (typeof skills === "string") {
    return safeJsonParse(skills, []);
  }
  return [];
}
