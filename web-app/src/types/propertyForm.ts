export interface PropertyFormData {
  // Step 1: Basic Details
  title: string;
  description: string;
  property_type: "residential" | "commercial";
  listing_type: "sale" | "rent";

  // Step 2: Location Details
  state: string;
  city: string;
  address?: string;
  pincode?: string;

  // Step 3: Property Profile
  bedrooms?: number;
  bathrooms?: number;
  area?: number; // in sq ft
  floor_number?: number;
  age?: "under_1_year" | "1_2_years" | "2_5_years" | "10_plus_years";
  furnishing_status?: "furnished" | "semi_furnished" | "unfurnished";

  // Step 4: Photos, Videos & Voice-over
  images: File[];

  // Step 5: Pricing
  sale_price?: number; // For sale properties
  monthly_rent?: number; // For rental properties
  price_negotiable: boolean;
}

export interface PropertyFormStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
  editable?: boolean;
  required?: boolean;
}

export interface PropertyFormValidation {
  [key: string]: {
    isValid: boolean;
    errors: string[];
  };
}

export interface PropertyFormState {
  currentStep: number;
  formData: PropertyFormData;
  validation: PropertyFormValidation;
  isSubmitting: boolean;
  submitError?: string;
}
