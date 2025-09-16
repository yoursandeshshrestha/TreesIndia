"use client";

import { useState, useCallback } from "react";
import {
  PropertyFormData,
  PropertyFormState,
  PropertyFormStep,
} from "@/types/propertyForm";

const initialFormData: PropertyFormData = {
  title: "",
  description: "",
  property_type: "residential",
  listing_type: "sale",
  state: "",
  city: "",
  address: "",
  pincode: "",
  bedrooms: undefined,
  bathrooms: undefined,
  area: undefined,
  floor_number: undefined,
  age: undefined,
  furnishing_status: undefined,
  images: [],
  sale_price: undefined,
  monthly_rent: undefined,
  price_negotiable: true,
};

const steps: PropertyFormStep[] = [
  {
    id: "1",
    title: "Basic Details",
    description: "Property type and listing details",
    status: "pending",
    required: true,
  },
  {
    id: "2",
    title: "Location Details",
    description: "Where is your property located?",
    status: "pending",
    required: true,
  },
  {
    id: "3",
    title: "Property Profile",
    description: "Property features and specifications",
    status: "pending",
    required: false,
  },
  {
    id: "4",
    title: "Photos",
    description: "Upload property images",
    status: "pending",
    required: true,
  },
  {
    id: "5",
    title: "Pricing",
    description: "Set your property price",
    status: "pending",
    required: true,
  },
];

export function usePropertyForm() {
  const [formState, setFormState] = useState<PropertyFormState>({
    currentStep: 0,
    formData: initialFormData,
    validation: {},
    isSubmitting: false,
  });

  const updateFormData = useCallback((data: Partial<PropertyFormData>) => {
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
          if (!formState.formData.property_type) errors.push("property_type");
          if (!formState.formData.listing_type) errors.push("listing_type");
          break;

        case 1: // Location Details
          if (!formState.formData.state.trim()) errors.push("state");
          if (!formState.formData.city.trim()) errors.push("city");
          break;

        case 2: // Property Profile
          // Optional step, no validation required
          break;

        case 3: // Photos
          if (formState.formData.images.length < 2) errors.push("images");
          break;

        case 4: // Pricing
          if (
            formState.formData.listing_type === "sale" &&
            !formState.formData.sale_price
          ) {
            errors.push("sale_price");
          }
          if (
            formState.formData.listing_type === "rent" &&
            !formState.formData.monthly_rent
          ) {
            errors.push("monthly_rent");
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formState.formData, steps]
  );

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setFormState((prev) => ({
        ...prev,
        currentStep: stepIndex,
      }));
    }
  }, []);

  const canProceedToNext = useCallback(
    (stepIndex: number): boolean => {
      return validateStep(stepIndex, false);
    },
    [validateStep]
  );

  const nextStep = useCallback(() => {
    const currentStepIndex = formState.currentStep;
    const isValid = validateStep(currentStepIndex);

    if (isValid && currentStepIndex < steps.length - 1) {
      setFormState((prev) => ({
        ...prev,
        currentStep: currentStepIndex + 1,
      }));
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

  const getCurrentStepData = useCallback(() => {
    return steps[formState.currentStep];
  }, [formState.currentStep]);

  const getUpdatedSteps = useCallback((): PropertyFormStep[] => {
    return steps.map((step, index) => {
      let status: "completed" | "active" | "pending" = "pending";

      if (index < formState.currentStep) {
        status = "completed";
      } else if (index === formState.currentStep) {
        status = "active";
      }

      return {
        ...step,
        status,
        editable: index < formState.currentStep,
      };
    });
  }, [formState.currentStep]);

  const getStepErrors = useCallback(
    (stepId: string): string[] => {
      return formState.validation[stepId]?.errors || [];
    },
    [formState.validation]
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
    steps: getUpdatedSteps(),
    currentStep: getCurrentStepData(),
    updateFormData,
    validateStep,
    canProceedToNext,
    goToStep,
    nextStep,
    previousStep,
    getStepErrors,
    resetForm,
    setFormState,
  };
}
