import { Worker } from "@/types/worker";
import { UserSubscription } from "@/types/subscription";
import { PaymentMethod } from "@/types/payment";

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
    subscription: UserSubscription | null; // Raw subscription data from API - will be transformed
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
 * Transform raw subscription data to UserSubscription type
 */
function transformSubscription(subscriptionData: UserSubscription | Record<string, unknown> | null): UserSubscription | null {
  if (!subscriptionData) {
    return null;
  }

  // Type guard to check if it's already a proper UserSubscription object
  const isUserSubscription = (data: UserSubscription | Record<string, unknown>): data is UserSubscription => {
    return typeof data === 'object' && 
           data !== null && 
           'ID' in data && 
           'CreatedAt' in data && 
           'UpdatedAt' in data && 
           'DeletedAt' in data &&
           'user_id' in data &&
           'plan_id' in data &&
           'start_date' in data &&
           'end_date' in data &&
           'status' in data &&
           'payment_method' in data &&
           'amount' in data &&
           'payment_reference' in data;
  };

  // If it's already a proper UserSubscription object, return it
  if (isUserSubscription(subscriptionData)) {
    return subscriptionData;
  }

  // If it's a simple object with id, name, status, create a minimal UserSubscription
  if ('id' in subscriptionData && 'name' in subscriptionData && 'status' in subscriptionData) {
    return {
      ID: subscriptionData.id as number,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      DeletedAt: null,
      user_id: 0, // Will be set by the parent object
      plan_id: subscriptionData.id as number,
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
      status: subscriptionData.status as "active" | "expired" | "cancelled",
      payment_method: "wallet" as PaymentMethod, // Default payment method
      amount: 0,
      payment_reference: "",
    };
  }

  return null;
}

/**
 * Transform raw worker data from API to properly typed Worker object
 */
export function transformWorkerData(rawWorker: RawWorker): Worker {
  const transformedWorker: Worker = {
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
    user: rawWorker.user ? {
      ...rawWorker.user,
      subscription: transformSubscription(rawWorker.user.subscription),
    } : undefined,
  };

  return transformedWorker;
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
