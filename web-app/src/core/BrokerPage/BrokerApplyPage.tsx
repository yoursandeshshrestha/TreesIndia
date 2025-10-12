"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { useBrokerApplication } from "@/hooks/useBrokerApplication";
import { BrokerApplicationRequest } from "@/types/broker-application";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";
import { BrokerApplySidebar } from "./components";
import { useBrokerForm } from "./hooks/useBrokerForm";
import { toast } from "sonner";

// Import step components
import {
  PersonalInfoStep,
  DocumentsStep,
  AddressStep,
  BrokerDetailsStep,
  ReviewStep,
} from "./components";

function BrokerApplyPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<object | null>(null);

  const {
    userApplication,
    submitApplication,
    isSubmitting,
    submitError: hookSubmitError,
  } = useBrokerApplication();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    formState,
    steps: baseSteps,
    currentStep,
    updateFormData,
    canProceedToNext,
    goToStep,
    nextStep,
    previousStep,
    getStepErrors,
  } = useBrokerForm();

  // Clear submit error when user makes changes
  const handleFormUpdate = (field: string, value: string | File) => {
    updateFormData(field, value);
  };

  const handleFileUpdate = (field: string, file: File | null) => {
    updateFormData(field, file);
  };

  // Create steps with current status
  const steps = baseSteps.map((step, index) => ({
    ...step,
    status:
      index < formState.currentStep
        ? ("completed" as const)
        : index === formState.currentStep
        ? ("active" as const)
        : ("pending" as const),
    editable: true, // All steps are editable
  }));

  const handleStepClick = (stepId: string) => {
    const stepIndex = parseInt(stepId) - 1;
    goToStep(stepIndex);
  };

  const handleEditStep = (stepId: string) => {
    const stepIndex = parseInt(stepId) - 1;
    goToStep(stepIndex);
  };

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Check if user already has an application
  useEffect(() => {
    if (userApplication) {
      // User already has an application
      // If approved, show congratulatory message
      if (userApplication.status === "approved") {
        // Load celebration animation
        const loadCelebrationAnimation = async () => {
          try {
            const response = await fetch("/images/auth/celebration.json");
            const animation = await response.json();
            setSuccessAnimation(animation);
          } catch (error) {
            console.error("Error loading celebration animation:", error);
          }
        };
        loadCelebrationAnimation();
      }
    }
  }, [userApplication]);

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleSubmit = async () => {
    setIsSuccess(false);

    // Convert form data to the format expected by the API
    const applicationData: BrokerApplicationRequest = {
      license: formState.formData.license,
      agency: formState.formData.agency,
      contact_info: formState.formData.contact_info,
      address: formState.formData.address,
      aadhar_card: formState.formData.aadhar_card!,
      pan_card: formState.formData.pan_card!,
      profile_pic: formState.formData.profile_pic!,
    };

    submitApplication(applicationData, {
      onSuccess: async () => {
        // Load success animation
        try {
          const response = await fetch("/images/auth/celebration.json");
          const animation = await response.json();
          setSuccessAnimation(animation);
        } catch (error) {
          console.error("Error loading celebration animation:", error);
        }

        toast.success("Broker application submitted successfully!");
        setIsSuccess(true);
      },
      onError: (error) => {
        console.error("Error submitting broker application:", error);

        // Parse error message for better user experience
        let errorMessage = "Failed to submit application";

        if (error.message) {
          if (error.message.includes("email already exists")) {
            errorMessage =
              "This email address is already registered. Please use a different email or contact support.";
          } else if (error.message.includes("Missing required fields")) {
            errorMessage =
              "Please fill in all required fields before submitting.";
          } else if (error.message.includes("Invalid")) {
            errorMessage = "Please check your information and try again.";
          } else {
            errorMessage = error.message;
          }
        }

        toast.error(errorMessage);
      },
    });
  };

  const renderStepContent = () => {
    const stepErrors = getStepErrors(currentStep.id);
    const errorRecord = stepErrors.reduce((acc, error) => {
      acc[currentStep.id] = error;
      return acc;
    }, {} as Record<string, string>);

    switch (formState.currentStep) {
      case 0:
        return (
          <PersonalInfoStep
            formData={formState.formData}
            errors={errorRecord}
            onFieldChange={handleFormUpdate}
          />
        );
      case 1:
        return (
          <DocumentsStep
            formData={formState.formData}
            errors={errorRecord}
            onFileChange={handleFileUpdate}
          />
        );
      case 2:
        return (
          <AddressStep
            formData={formState.formData}
            errors={errorRecord}
            onFieldChange={handleFormUpdate}
          />
        );
      case 3:
        return (
          <BrokerDetailsStep
            formData={formState.formData}
            errors={errorRecord}
            onFieldChange={handleFormUpdate}
          />
        );
      case 4:
        return (
          <ReviewStep formData={formState.formData} errors={errorRecord} />
        );
      default:
        return null;
    }
  };

  // Show loading state
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Show success state
  if (isSuccess || userApplication?.status === "approved") {
    const isApproved = userApplication?.status === "approved";

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          {successAnimation && (
            <div className="mb-6">
              <Lottie
                animationData={successAnimation}
                loop={false}
                style={{ height: 150, maxHeight: 200 }}
              />
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            {isApproved
              ? "Congratulations!"
              : "Application Submitted Successfully!"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {isApproved
              ? "Your broker application has been approved! You can now start listing properties and managing real estate transactions."
              : "Your broker application has been submitted and is under review. We'll notify you once it's processed."}
          </p>
          <button
            onClick={handleBackToHome}
            className="w-full bg-[#00a871] text-white py-2.5 sm:py-2 px-4 rounded-lg hover:bg-[#008a5e] transition-colors text-sm sm:text-base font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const canProceed = () => {
    return canProceedToNext(formState.currentStep);
  };

  const isLastStep = formState.currentStep === steps.length - 1;

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Back Button */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={handleBackToHome}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Go Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <BrokerApplySidebar
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

            {hookSubmitError && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs sm:text-sm font-medium text-red-800">
                      Submission Failed
                    </h3>
                    <div className="mt-2 text-xs sm:text-sm text-red-700">
                      <p>
                        {hookSubmitError instanceof Error
                          ? hookSubmitError.message
                          : "Failed to submit application. Please try again."}
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-4">
                      <button
                        onClick={() => window.location.reload()}
                        className="text-xs sm:text-sm bg-red-100 text-red-800 px-3 py-1.5 sm:py-1 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {renderStepContent()}

            {/* Continue/Submit Button */}
            <div className="flex justify-start mt-6 sm:mt-8">
              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-2 bg-[#00a871] text-white rounded-md hover:bg-[#008f5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
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

export default BrokerApplyPage;
