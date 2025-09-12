export interface VendorFormData {
  vendor_name: string;
  business_description: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
  business_address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  business_type:
    | "individual"
    | "partnership"
    | "company"
    | "llp"
    | "pvt_ltd"
    | "public_ltd"
    | "other";
  years_in_business: number;
  services_offered: string[];
  profile_picture: File | null;
  business_gallery: File[];
}

export interface VendorFormStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed" | "current";
  required: boolean;
  editable?: boolean;
}

export interface VendorFormState {
  formData: VendorFormData;
  currentStep: number;
  steps: VendorFormStep[];
}
