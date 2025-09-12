import { useState, useCallback } from "react";

export interface BrokerFormStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed";
}

export interface BrokerFormState {
  currentStep: number;
  formData: {
    license: string;
    agency: string;
    contact_info: string;
    address: string;
    aadhar_card: File | null;
    pan_card: File | null;
    profile_pic: File | null;
  };
  validation: Record<string, { isValid: boolean; errors: string[] }>;
  isSubmitting: boolean;
}

const initialFormData = {
  license: "",
  agency: "",
  contact_info: "{}",
  address: "{}",
  aadhar_card: null,
  pan_card: null,
  profile_pic: null,
};

const baseSteps: Omit<BrokerFormStep, "status">[] = [
  {
    id: "1",
    title: "Personal Information",
    description: "Contact details and basic info",
  },
  {
    id: "2",
    title: "Documents Upload",
    description: "Required documents",
  },
  {
    id: "3",
    title: "Address Information",
    description: "Residential address",
  },
  {
    id: "4",
    title: "Broker Details",
    description: "License and agency info",
  },
  {
    id: "5",
    title: "Review & Submit",
    description: "Final review and submission",
  },
];

export function useBrokerForm() {
  const [formState, setFormState] = useState<BrokerFormState>({
    currentStep: 0,
    formData: initialFormData,
    validation: {},
    isSubmitting: false,
  });

  const updateFormData = useCallback((field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  }, []);

  const validateStep = useCallback(
    (stepIndex: number, updateState: boolean = true): boolean => {
      const step = baseSteps[stepIndex];
      const errors: string[] = [];

      switch (stepIndex) {
        case 0: // Personal Information
          const contactInfo = formState.formData.contact_info
            ? JSON.parse(formState.formData.contact_info)
            : {};

          if (!contactInfo.name?.trim()) {
            errors.push("Full name is required");
          } else if (!contactInfo.email?.trim()) {
            errors.push("Email address is required");
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
            errors.push("Please enter a valid email address format");
          } else if (!contactInfo.alternative_number?.trim()) {
            errors.push("Alternative phone number is required");
          } else if (
            !/^\+?[0-9]{10,20}$/.test(contactInfo.alternative_number)
          ) {
            errors.push(
              "Please enter a valid alternative phone number (10-20 digits, + allowed)"
            );
          }
          break;

        case 1: // Documents Upload
          if (!formState.formData.aadhar_card) {
            errors.push("Aadhaar card is required");
          }
          if (!formState.formData.pan_card) {
            errors.push("PAN card is required");
          }
          if (!formState.formData.profile_pic) {
            errors.push("Profile picture is required");
          }
          break;

        case 2: // Address Information
          const addressInfo = formState.formData.address
            ? JSON.parse(formState.formData.address)
            : {};
          if (!addressInfo.street?.trim()) {
            errors.push("Street address is required");
          }
          if (!addressInfo.city?.trim()) {
            errors.push("City is required");
          }
          if (!addressInfo.state?.trim()) {
            errors.push("State is required");
          }
          if (!addressInfo.pincode?.trim()) {
            errors.push("Pincode is required");
          } else if (!/^\d{6}$/.test(addressInfo.pincode)) {
            errors.push("Please enter a valid 6-digit pincode");
          }
          break;

        case 3: // Broker Details
          if (!formState.formData.license?.trim()) {
            errors.push("Broker license is required");
          }
          if (!formState.formData.agency?.trim()) {
            errors.push("Agency name is required");
          }
          break;

        case 4: // Review & Submit
          // All previous validations should pass
          break;
      }

      const isValid = errors.length === 0;

      if (updateState) {
        setFormState((prev) => ({
          ...prev,
          validation: {
            ...prev.validation,
            [step.id]: {
              isValid,
              errors,
            },
          },
        }));
      }

      return isValid;
    },
    [formState.formData]
  );

  const canProceedToNext = useCallback(
    (stepIndex: number): boolean => {
      return validateStep(stepIndex, false);
    },
    [validateStep]
  );

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < baseSteps.length) {
      setFormState((prev) => ({
        ...prev,
        currentStep: stepIndex,
      }));
    }
  }, []);

  const nextStep = useCallback(() => {
    if (formState.currentStep < baseSteps.length - 1) {
      if (validateStep(formState.currentStep)) {
        setFormState((prev) => ({
          ...prev,
          currentStep: prev.currentStep + 1,
        }));
      }
    }
  }, [formState.currentStep, validateStep]);

  const previousStep = useCallback(() => {
    if (formState.currentStep > 0) {
      setFormState((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  }, [formState.currentStep]);

  const getStepErrors = useCallback(
    (stepId: string): string[] => {
      return formState.validation[stepId]?.errors || [];
    },
    [formState.validation]
  );

  return {
    formState,
    steps: baseSteps,
    currentStep: baseSteps[formState.currentStep],
    updateFormData,
    canProceedToNext,
    goToStep,
    nextStep,
    previousStep,
    getStepErrors,
    errors: formState.validation,
  };
}
