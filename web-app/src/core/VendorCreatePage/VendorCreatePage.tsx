import React, { useState } from "react";
import VendorCreateSidebar from "./components/VendorCreateSidebar";
import { useVendorForm } from "./hooks/useVendorForm";
import {
  BasicDetailsStep,
  ContactInformationStep,
  BusinessDetailsStep,
  LocationDetailsStep,
  PhotosStep,
} from "./components/steps";
import { ChevronRight, CheckCircle, ArrowLeft } from "lucide-react";
import { createVendor } from "@/lib/vendorApi";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useVendorStats } from "@/hooks/useVendors";
import { SubscriptionRequired } from "@/commonComponents/SubscriptionRequired";

function VendorCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // First, fetch user profile to check subscription status
  const { userProfile, isLoadingProfile } = useProfile();

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscription?.status === "active";

  // Fetch vendor stats (always fetch, even without subscription to show in UI)
  const { data: statsResponse } = useVendorStats(true);

  const {
    formState,
    steps,
    currentStep,
    updateFormData,
    canProceedToNext,
    goToStep,
    nextStep,
    previousStep,
    getStepErrors,
  } = useVendorForm();

  const handleStepClick = (stepId: string) => {
    const stepIndex = parseInt(stepId) - 1;
    goToStep(stepIndex);
  };

  const handleEditStep = (stepId: string) => {
    const stepIndex = parseInt(stepId) - 1;
    goToStep(stepIndex);
  };

  // Show loading state while checking profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show subscription required UI if user doesn't have active subscription
  if (!hasActiveSubscription) {
    return (
      <SubscriptionRequired
        title="Subscription Required to Create Vendor Profiles"
        description="You need an active subscription to create and manage vendor profiles."
        features={[
          "Create and manage your vendor profiles",
          "Upload business images and details",
          "Set business information and services",
          "Manage contact information",
          "Priority customer support",
        ]}
        vendorStats={statsResponse?.data}
      />
    );
  }

  const renderCurrentStep = () => {
    const stepErrors = getStepErrors(currentStep.id);

    switch (formState.currentStep) {
      case 0:
        return (
          <BasicDetailsStep
            formData={formState.formData}
            onUpdate={updateFormData}
            errors={stepErrors}
          />
        );
      case 1:
        return (
          <ContactInformationStep
            formData={formState.formData}
            onUpdate={updateFormData}
            errors={stepErrors}
          />
        );
      case 2:
        return (
          <BusinessDetailsStep
            formData={formState.formData}
            onUpdate={updateFormData}
            errors={stepErrors}
          />
        );
      case 3:
        return (
          <LocationDetailsStep
            formData={formState.formData}
            onUpdate={updateFormData}
            errors={stepErrors}
          />
        );
      case 4:
        return (
          <PhotosStep
            formData={formState.formData}
            onUpdate={updateFormData}
            errors={stepErrors}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    return canProceedToNext(formState.currentStep);
  };

  const isLastStep = formState.currentStep === steps.length - 1;

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare form data for API
      const vendorData = {
        vendor_name: formState.formData.vendor_name,
        business_description: formState.formData.business_description,
        contact_person_name: formState.formData.contact_person_name,
        contact_person_phone: formState.formData.contact_person_phone,
        contact_person_email: formState.formData.contact_person_email,
        business_address: formState.formData.business_address,
        business_type: formState.formData.business_type,
        years_in_business: formState.formData.years_in_business,
        services_offered: formState.formData.services_offered,
        profile_picture: formState.formData.profile_picture || undefined,
        business_gallery: formState.formData.business_gallery,
      };

      const response = await createVendor(vendorData);

      if (response.success) {
        setIsSuccess(true);
        // Redirect to vendor detail page after a short delay
        setTimeout(() => {
          router.push(`/marketplace/vendors/${response.data.ID}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create vendor profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Vendor Profile Created Successfully!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Your vendor profile has been submitted and is under review.
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Redirecting to your vendor profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Back Button */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Go Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <VendorCreateSidebar
            steps={steps}
            onStepClick={handleStepClick}
            onEditStep={handleEditStep}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white px-2 sm:px-4 lg:pl-2">
            {/* Step Back Button - Show after first step */}
            {formState.currentStep > 0 && (
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={previousStep}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">Previous Step</span>
                </button>
              </div>
            )}

            {submitError && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-xs sm:text-sm">{submitError}</p>
              </div>
            )}
            {renderCurrentStep()}

            {/* Continue/Submit Button */}
            <div className="flex justify-start mt-6 sm:mt-8">
              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-2 bg-[#00a871] text-white rounded-md hover:bg-[#008f5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
                >
                  {isSubmitting ? "Publishing..." : "Publish Vendor Profile"}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-2 bg-[#00a871] text-white rounded-md hover:bg-[#008f5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
                >
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorCreatePage;
