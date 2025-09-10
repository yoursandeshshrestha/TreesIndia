import React, { useState } from "react";
import ProjectCreateSidebar from "./components/ProjectCreateSidebar";
import { useProjectForm } from "./hooks/useProjectForm";
import BasicDetailsStep from "./components/steps/BasicDetailsStep";
import LocationDetailsStep from "./components/steps/LocationDetailsStep";
import ProjectDetailsStep from "./components/steps/ProjectDetailsStep";
import PhotosStep from "./components/steps/PhotosStep";
import { ChevronRight, CheckCircle, ArrowLeft } from "lucide-react";
import { createProject } from "@/lib/projectApi";
import { useRouter } from "next/navigation";

function ProjectCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
  } = useProjectForm();

  const handleStepClick = (stepId: string) => {
    const stepIndex = parseInt(stepId) - 1;
    goToStep(stepIndex);
  };

  const handleEditStep = (stepId: string) => {
    const stepIndex = parseInt(stepId) - 1;
    goToStep(stepIndex);
  };

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
          <LocationDetailsStep
            formData={formState.formData}
            onUpdate={updateFormData}
            errors={stepErrors}
          />
        );
      case 2:
        return (
          <ProjectDetailsStep
            formData={formState.formData}
            onUpdate={updateFormData}
            errors={stepErrors}
          />
        );
      case 3:
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
      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Add basic fields
      formData.append("title", formState.formData.title);
      formData.append("description", formState.formData.description);
      formData.append("project_type", formState.formData.project_type);
      formData.append("status", formState.formData.status);
      formData.append("state", formState.formData.state);
      formData.append("city", formState.formData.city);
      formData.append("address", formState.formData.address);
      formData.append("pincode", formState.formData.pincode);

      if (formState.formData.estimated_duration_days) {
        formData.append(
          "estimated_duration_days",
          formState.formData.estimated_duration_days.toString()
        );
      }

      // Add contact info as JSON
      formData.append(
        "contact_info",
        JSON.stringify(formState.formData.contact_info)
      );

      // Add images
      formState.formData.images.forEach((image) => {
        formData.append(`images`, image);
      });

      const response = await createProject(formData);

      if (response.success) {
        setIsSuccess(true);
        // Redirect to the created project after a short delay
        setTimeout(() => {
          router.push(`/marketplace/projects/${response.data.ID}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create project"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Project Created Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your project listing has been submitted and is under review.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Top Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Go Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ProjectCreateSidebar
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

            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{submitError}</p>
              </div>
            )}
            {renderCurrentStep()}

            {/* Continue/Submit Button */}
            <div className="flex justify-start mt-8">
              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="px-6 py-2 bg-[#00a871] text-white rounded-md hover:bg-[#008f5f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Publishing..." : "Publish Project"}
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

export default ProjectCreatePage;
