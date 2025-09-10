export interface ProjectFormData {
  // Step 1: Basic Details
  title: string;
  description: string;
  project_type: "residential" | "commercial" | "infrastructure";
  status: "starting_soon" | "on_going" | "completed" | "cancelled" | "on_hold";

  // Step 2: Location Details
  state: string;
  city: string;
  address: string;
  pincode: string;

  // Step 3: Project Details
  estimated_duration_days?: number;
  contact_info: {
    phone?: string;
    email?: string;
    alternative_number?: string;
    contact_person?: string;
  };

  // Step 4: Photos
  images: File[];
}

export interface ProjectFormStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
  editable?: boolean;
  required?: boolean;
}

export interface ProjectFormValidation {
  [key: string]: {
    isValid: boolean;
    errors: string[];
  };
}

export interface ProjectFormState {
  currentStep: number;
  formData: ProjectFormData;
  validation: ProjectFormValidation;
  isSubmitting: boolean;
  submitError?: string;
}
