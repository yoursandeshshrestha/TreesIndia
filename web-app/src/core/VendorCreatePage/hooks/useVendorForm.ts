"use client";

import { useState, useCallback } from "react";
import {
  VendorFormData,
  VendorFormState,
  VendorFormStep,
} from "@/types/vendorForm";

const initialFormData: VendorFormData = {
  vendor_name: "",
  business_description: "",
  contact_person_name: "",
  contact_person_phone: "",
  contact_person_email: "",
  business_address: {
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  },
  business_type: "individual",
  years_in_business: 0,
  services_offered: [],
  profile_picture: null,
  business_gallery: [],
};

const steps: VendorFormStep[] = [
  {
    id: "1",
    title: "Basic Details",
    description: "Business name and description",
    status: "pending",
    required: true,
    editable: true,
  },
  {
    id: "2",
    title: "Contact Information",
    description: "Contact person details",
    status: "pending",
    required: true,
    editable: true,
  },
  {
    id: "3",
    title: "Business Details",
    description: "Business type and materials",
    status: "pending",
    required: true,
    editable: true,
  },
  {
    id: "4",
    title: "Location Details",
    description: "Business address and location",
    status: "pending",
    required: true,
    editable: true,
  },
  {
    id: "5",
    title: "Photos",
    description: "Upload business photos",
    status: "pending",
    required: true,
    editable: true,
  },
];

export function useVendorForm() {
  const [formState, setFormState] = useState<VendorFormState>({
    formData: initialFormData,
    currentStep: 0,
    steps: steps.map((step, index) => ({
      ...step,
      status: index === 0 ? "current" : "pending",
    })),
  });

  const updateFormData = useCallback((updates: Partial<VendorFormData>) => {
    setFormState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
    }));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;

    setFormState((prev) => ({
      ...prev,
      currentStep: stepIndex,
      steps: prev.steps.map((step, index) => ({
        ...step,
        status:
          index < stepIndex
            ? "completed"
            : index === stepIndex
            ? "current"
            : "pending",
      })),
    }));
  }, []);

  const nextStep = useCallback(() => {
    if (formState.currentStep < steps.length - 1) {
      goToStep(formState.currentStep + 1);
    }
  }, [formState.currentStep, goToStep]);

  const previousStep = useCallback(() => {
    if (formState.currentStep > 0) {
      goToStep(formState.currentStep - 1);
    }
  }, [formState.currentStep, goToStep]);

  const canProceedToNext = useCallback(
    (stepIndex: number) => {
      const { formData } = formState;

      switch (stepIndex) {
        case 0: // Basic Details
          return formData.vendor_name.trim() !== "";
        case 1: // Contact Information
          return (
            formData.contact_person_name.trim() !== "" &&
            formData.contact_person_phone.trim() !== ""
          );
        case 2: // Business Details
          return formData.services_offered.length > 0;
        case 3: // Location Details
          return (
            formData.business_address.street.trim() !== "" &&
            formData.business_address.city.trim() !== "" &&
            formData.business_address.state.trim() !== "" &&
            formData.business_address.pincode.trim() !== ""
          );
        case 4: // Photos
          return formData.business_gallery.length >= 2; // Minimum 2 gallery images required
        default:
          return false;
      }
    },
    [formState]
  );

  const getStepErrors = useCallback(
    (stepId: string) => {
      const { formData } = formState;
      const errors: string[] = [];

      switch (stepId) {
        case "1": // Basic Details
          if (!formData.vendor_name.trim()) {
            errors.push("vendor_name");
          }
          break;
        case "2": // Contact Information
          if (!formData.contact_person_name.trim()) {
            errors.push("contact_person_name");
          }
          if (!formData.contact_person_phone.trim()) {
            errors.push("contact_person_phone");
          }
          if (
            formData.contact_person_email &&
            !/\S+@\S+\.\S+/.test(formData.contact_person_email)
          ) {
            errors.push("contact_person_email");
          }
          break;
        case "3": // Business Details
          if (!formData.business_type) {
            errors.push("business_type");
          }
          if (formData.services_offered.length === 0) {
            errors.push("services_offered");
          }
          break;
        case "4": // Location Details
          if (!formData.business_address.street.trim()) {
            errors.push("street");
          }
          if (!formData.business_address.city.trim()) {
            errors.push("city");
          }
          if (!formData.business_address.state.trim()) {
            errors.push("state");
          }
          if (!formData.business_address.pincode.trim()) {
            errors.push("pincode");
          }
          break;
        case "5": // Photos
          if (formData.business_gallery.length < 2) {
            errors.push("business_gallery");
          }
          break;
      }

      return errors;
    },
    [formState]
  );

  const currentStep = steps[formState.currentStep];

  return {
    formState,
    steps: formState.steps,
    currentStep,
    updateFormData,
    canProceedToNext,
    goToStep,
    nextStep,
    previousStep,
    getStepErrors,
  };
}
