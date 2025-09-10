"use client";

import { useState, useCallback } from "react";
import {
  ProjectFormData,
  ProjectFormState,
  ProjectFormStep,
} from "@/types/projectForm";

const initialFormData: ProjectFormData = {
  title: "",
  description: "",
  project_type: "residential",
  status: "starting_soon",
  state: "",
  city: "",
  address: "",
  pincode: "",
  estimated_duration_days: undefined,
  contact_info: {
    phone: "",
    email: "",
    alternative_number: "",
    contact_person: "",
  },
  images: [],
};

const steps: ProjectFormStep[] = [
  {
    id: "1",
    title: "Basic Details",
    description: "Project type and basic information",
    status: "pending",
    required: true,
  },
  {
    id: "2",
    title: "Location Details",
    description: "Where is your project located?",
    status: "pending",
    required: true,
  },
  {
    id: "3",
    title: "Project Details",
    description: "Project timeline and contact information",
    status: "pending",
    required: false,
  },
  {
    id: "4",
    title: "Photos",
    description: "Upload project images",
    status: "pending",
    required: true,
  },
];

export function useProjectForm() {
  const [formState, setFormState] = useState<ProjectFormState>({
    currentStep: 0,
    formData: initialFormData,
    validation: {},
    isSubmitting: false,
  });

  const updateFormData = useCallback((data: Partial<ProjectFormData>) => {
    setFormState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...data },
    }));
  }, []);

  const validateStep = useCallback(
    (stepIndex: number, updateState: boolean = true): boolean => {
      const step = steps[stepIndex];
      const errors: string[] = [];

      switch (stepIndex) {
        case 0: // Basic Details
          if (!formState.formData.title.trim()) errors.push("title");
          if (!formState.formData.description.trim())
            errors.push("description");
          if (!formState.formData.project_type) errors.push("project_type");
          if (!formState.formData.status) errors.push("status");
          break;

        case 1: // Location Details
          if (!formState.formData.state.trim()) errors.push("state");
          if (!formState.formData.city.trim()) errors.push("city");
          if (!formState.formData.address.trim()) errors.push("address");
          if (!formState.formData.pincode.trim()) errors.push("pincode");
          break;

        case 2: // Project Details
          // Optional step, no validation required
          break;

        case 3: // Photos
          if (formState.formData.images.length === 0) errors.push("images");
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
