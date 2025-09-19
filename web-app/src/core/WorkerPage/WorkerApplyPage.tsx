"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useWorkerApplication } from "@/hooks/useWorkerApplication";
import { WorkerApplicationRequest } from "@/types/worker-application";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";
import { WorkerApplySidebar } from "./components";
import { useWorkerForm } from "./hooks/useWorkerForm";
import { toast } from "sonner";

// Import step components
import {
  PersonalInfoStep,
  DocumentsStep,
  AddressStep,
  SkillsStep,
  BankingStep,
  ReviewStep,
} from "./components";

function WorkerApplyPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<object | null>(null);

  const {
    userApplication,
    submitApplication,
    isSubmitting,
    submitError: hookSubmitError,
  } = useWorkerApplication();
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
  } = useWorkerForm();

  // Create steps with current status
  const steps = baseSteps.map((step, index) => ({
    ...step,
    status:
      index < formState.currentStep
        ? ("completed" as const)
        : index === formState.currentStep
        ? ("active" as const)
        : ("pending" as const),
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

  const handleFieldChange = (field: string, value: string) => {
    updateFormData(field, value);
  };

  const handleFileChange = (field: string, file: File | null) => {
    updateFormData(field, file);
  };

  const handleSubmit = async () => {
    setIsSuccess(false);

    // Convert form data to the format expected by the API
    const applicationData: WorkerApplicationRequest = {
      experience_years: formState.formData.experience_years!,
      skills: formState.formData.skills!,
      contact_info: formState.formData.contact_info!,
      address: formState.formData.address!,
      banking_info: formState.formData.banking_info!,
      aadhar_card: formState.formData.aadhar_card!,
      pan_card: formState.formData.pan_card!,
      profile_pic: formState.formData.profile_pic!,
      police_verification: formState.formData.police_verification!,
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

        toast.success("Worker application submitted successfully!");
        setIsSuccess(true);
      },
      onError: (error) => {
        console.error("Error submitting worker application:", error);

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

  const handleBackToHome = () => {
    router.push("/");
  };

  const renderCurrentStep = () => {
    const stepErrors = getStepErrors(currentStep.id);
    // Convert string array to Record<string, string> format
    const errorsRecord: Record<string, string> = {};
    stepErrors.forEach((error, index) => {
      errorsRecord[`error_${index}`] = error;
    });

    switch (formState.currentStep) {
      case 0:
        return (
          <PersonalInfoStep
            formData={formState.formData}
            errors={errorsRecord}
            onFieldChange={handleFieldChange}
          />
        );
      case 1:
        return (
          <DocumentsStep
            formData={formState.formData}
            errors={errorsRecord}
            onFileChange={handleFileChange}
          />
        );
      case 2:
        return (
          <AddressStep
            formData={formState.formData}
            errors={errorsRecord}
            onFieldChange={handleFieldChange}
          />
        );
      case 3:
        return (
          <SkillsStep
            formData={formState.formData}
            errors={errorsRecord}
            onFieldChange={handleFieldChange}
          />
        );
      case 4:
        return (
          <BankingStep
            formData={formState.formData}
            errors={errorsRecord}
            onFieldChange={handleFieldChange}
          />
        );
      case 5:
        return (
          <ReviewStep formData={formState.formData} errors={errorsRecord} />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    return canProceedToNext(formState.currentStep);
  };

  const isLastStep = formState.currentStep === steps.length - 1;

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <LoadingSpinner
        message="Checking authentication..."
        variant="fullscreen"
      />
    );
  }

  // If user already has an application, show status
  if (userApplication) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to home</span>
            </button>
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="text-center">
            <div className="mx-auto w-32 h-32 mb-6">
              {successAnimation ? (
                <Lottie
                  animationData={successAnimation}
                  loop={false}
                  autoplay={true}
                />
              ) : (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {userApplication.status === "approved"
                ? "Congratulations! "
                : "Application Submitted"}
            </h1>
            <p className="text-gray-600 mb-6">
              {userApplication.status === "approved"
                ? "Your worker application has been approved!"
                : "Your worker application has been submitted successfully. We'll review your application and get back to you soon."}
            </p>
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Application Status
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    userApplication.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : userApplication.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : userApplication.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : userApplication.status === "under_review"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {userApplication.status.replace("_", " ").toUpperCase()}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Application ID: #{userApplication.ID}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Submitted on:{" "}
                    {userApplication.submitted_at
                      ? new Date(
                          userApplication.submitted_at
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your worker application has been submitted and is under review.
          </p>
          <p className="text-sm text-gray-500">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Top Back Button */}
      <div className="mb-6">
        <button
          onClick={handleBackToHome}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Go Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <WorkerApplySidebar
            steps={steps}
            onStepClick={handleStepClick}
            onEditStep={handleEditStep}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white pl-2">
            {/* Step Back Button - Show after first step */}
            {formState.currentStep > 0 && (
              <div className="mb-6">
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
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">
                  {hookSubmitError.message || String(hookSubmitError)}
                </p>
              </div>
            )}
            {renderCurrentStep()}

            {/* Continue/Submit Button */}
            <div className="flex justify-start mt-8">
              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-[#00a871] text-white rounded-md hover:bg-[#008f5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="flex items-center space-x-2 px-6 py-2 bg-[#00a871] text-white rounded-md hover:bg-[#008f5f] disabled:opacity-50 disabled:cursor-not-allowed"
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

export default WorkerApplyPage;
