"use client";

import { useState, useCallback } from "react";
import { WorkerApplicationRequest } from "@/types/worker-application";

export interface WorkerFormStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed";
  editable: boolean;
}

export interface WorkerFormState {
  currentStep: number;
  formData: Partial<WorkerApplicationRequest>;
  validation: Record<string, { isValid: boolean; errors: string[] }>;
  isSubmitting: boolean;
}

const initialFormData: Partial<WorkerApplicationRequest> = {
  experience_years: 0,
  skills: "[]",
  contact_info: "{}",
  address: "{}",
  banking_info: "{}",
};

const steps: WorkerFormStep[] = [
  {
    id: "1",
    title: "Personal Information",
    description: "Contact details",
    status: "pending",
    editable: true,
  },
  {
    id: "2",
    title: "Documents Upload",
    description: "Required documents",
    status: "pending",
    editable: true,
  },
  {
    id: "3",
    title: "Address Information",
    description: "Residential address",
    status: "pending",
    editable: true,
  },
  {
    id: "4",
    title: "Skills & Experience",
    description: "Work experience",
    status: "pending",
    editable: true,
  },
  {
    id: "5",
    title: "Banking Information",
    description: "Payment details",
    status: "pending",
    editable: true,
  },
  {
    id: "6",
    title: "Review & Submit",
    description: "Final review",
    status: "pending",
    editable: true,
  },
];

export function useWorkerForm() {
  const [formState, setFormState] = useState<WorkerFormState>({
    currentStep: 0,
    formData: initialFormData,
    validation: {},
    isSubmitting: false,
  });

  const updateFormData = useCallback((field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  }, []);

  const validateStep = useCallback(
    (stepIndex: number, updateState: boolean = true): boolean => {
      const step = steps[stepIndex];
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
            errors.push("Profile photo is required");
          }
          if (!formState.formData.police_verification) {
            errors.push("Police verification is required");
          }
          break;

        case 2: // Address Information
          const address = formState.formData.address
            ? JSON.parse(formState.formData.address)
            : {};
          if (!address.street?.trim()) {
            errors.push("Street address is required");
          } else if (!address.city?.trim()) {
            errors.push("City is required");
          } else if (!address.state?.trim()) {
            errors.push("State is required");
          } else if (!address.pincode?.trim()) {
            errors.push("Pincode is required");
          } else if (!/^\d{6}$/.test(address.pincode)) {
            errors.push("Please enter a valid 6-digit pincode");
          }
          break;

        case 3: // Skills & Experience
          if (
            !formState.formData.experience_years ||
            formState.formData.experience_years < 0
          ) {
            errors.push("Experience years is required and must be positive");
          }
          try {
            const skills = JSON.parse(formState.formData.skills || "[]");
            if (!Array.isArray(skills) || skills.length === 0) {
              errors.push("At least one skill is required");
            }
          } catch {
            errors.push("Invalid skills format");
          }
          break;

        case 4: // Banking Information
          try {
            const bankingInfo = JSON.parse(
              formState.formData.banking_info || "{}"
            );
            if (!bankingInfo.account_number) {
              errors.push("Account number is required");
            }
            if (!bankingInfo.ifsc_code) {
              errors.push("IFSC code is required");
            }
            if (!bankingInfo.bank_name) {
              errors.push("Bank name is required");
            }
            if (!bankingInfo.account_holder_name) {
              errors.push("Account holder name is required");
            }
          } catch {
            errors.push("Invalid banking info format");
          }
          break;

        case 5: // Review & Submit
          // All previous steps should be validated
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
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setFormState((prev) => ({
        ...prev,
        currentStep: stepIndex,
      }));
    }
  }, []);

  const nextStep = useCallback(() => {
    if (formState.currentStep < steps.length - 1) {
      const isValid = validateStep(formState.currentStep);
      if (isValid) {
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

  const updateStepStatus = useCallback(
    (stepIndex: number, status: "completed" | "active" | "pending") => {
      setFormState((prev) => ({
        ...prev,
        validation: {
          ...prev.validation,
          [steps[stepIndex].id]: {
            ...prev.validation[steps[stepIndex].id],
            isValid: status === "completed",
          },
        },
      }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormState({
      currentStep: 0,
      formData: initialFormData,
      validation: {},
      isSubmitting: false,
    });
  }, []);

  return {
    formState,
    steps,
    currentStep: steps[formState.currentStep],
    updateFormData,
    canProceedToNext,
    goToStep,
    nextStep,
    previousStep,
    getStepErrors,
    updateStepStatus,
    resetForm,
  };
}
