"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  User,
  FileText,
  Briefcase,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { useWorkerApplication } from "@/hooks/useWorkerApplication";
import { WorkerApplicationRequest } from "@/types/worker-application";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import Image from "next/image";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Import step components
import {
  PersonalInfoStep,
  DocumentsStep,
  AddressStep,
  SkillsStep,
  BankingStep,
  ReviewStep,
} from "./components";

const steps = [
  {
    id: 0,
    title: "Personal Information",
    icon: User,
    description: "Contact details",
  },
  {
    id: 1,
    title: "Documents Upload",
    icon: FileText,
    description: "Required documents",
  },
  {
    id: 2,
    title: "Address Information",
    icon: User,
    description: "Residential address",
  },
  {
    id: 3,
    title: "Skills & Experience",
    icon: Briefcase,
    description: "Work experience",
  },
  {
    id: 4,
    title: "Banking Information",
    icon: CreditCard,
    description: "Payment details",
  },
  {
    id: 5,
    title: "Review & Submit",
    icon: CheckCircle,
    description: "Final review",
  },
];

export default function WorkerApplyPage() {
  const {
    userApplication,
    isLoadingApplication,
    applicationError,
    submitApplication,
    isSubmitting,
    submitError,
  } = useWorkerApplication();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<WorkerApplicationRequest>>({
    experience_years: 0,
    skills: "[]",
    contact_info: "{}",
    address: "{}",
    banking_info: "{}",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successAnimation, setSuccessAnimation] = useState<object | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

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

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Personal Information
        const contactInfo = formData.contact_info
          ? JSON.parse(formData.contact_info)
          : {};
        if (!contactInfo.alternative_number?.trim()) {
          newErrors.contact_info = "Alternative phone number is required";
        } else if (!/^\d{10}$/.test(contactInfo.alternative_number)) {
          newErrors.contact_info = "Please enter a valid 10-digit phone number";
        }
        break;

      case 1: // Documents Upload
        if (!formData.aadhar_card) {
          newErrors.aadhar_card = "Aadhaar card is required";
        }
        if (!formData.pan_card) {
          newErrors.pan_card = "PAN card is required";
        }
        if (!formData.profile_pic) {
          newErrors.profile_pic = "Profile photo is required";
        }
        if (!formData.police_verification) {
          newErrors.police_verification = "Police verification is required";
        }
        break;

      case 2: // Address Information
        const address = formData.address ? JSON.parse(formData.address) : {};
        if (!address.street?.trim()) {
          newErrors.address = "Street address is required";
        } else if (!address.city?.trim()) {
          newErrors.address = "City is required";
        } else if (!address.state?.trim()) {
          newErrors.address = "State is required";
        } else if (!address.pincode?.trim()) {
          newErrors.address = "Pincode is required";
        } else if (!/^\d{6}$/.test(address.pincode)) {
          newErrors.address = "Please enter a valid 6-digit pincode";
        }
        break;

      case 3: // Skills & Experience
        if (!formData.experience_years || formData.experience_years < 0) {
          newErrors.experience_years =
            "Experience years is required and must be positive";
        }
        try {
          const skills = JSON.parse(formData.skills || "[]");
          if (!Array.isArray(skills) || skills.length === 0) {
            newErrors.skills = "At least one skill is required";
          }
        } catch {
          newErrors.skills = "Invalid skills format";
        }
        break;

      case 4: // Banking Information
        try {
          const bankingInfo = JSON.parse(formData.banking_info || "{}");
          if (!bankingInfo.account_number) {
            newErrors.banking_info = "Account number is required";
          }
          if (!bankingInfo.ifsc_code) {
            newErrors.banking_info = "IFSC code is required";
          }
          if (!bankingInfo.bank_name) {
            newErrors.banking_info = "Bank name is required";
          }
          if (!bankingInfo.account_holder_name) {
            newErrors.banking_info = "Account holder name is required";
          }
        } catch {
          newErrors.banking_info = "Invalid banking info format";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    // Clear error for this field when user uploads a file
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      const completeFormData: WorkerApplicationRequest = {
        experience_years: formData.experience_years!,
        skills: formData.skills!,
        contact_info: formData.contact_info!,
        address: formData.address!,
        banking_info: formData.banking_info!,
        aadhar_card: formData.aadhar_card!,
        pan_card: formData.pan_card!,
        profile_pic: formData.profile_pic!,
        police_verification: formData.police_verification!,
      };

      submitApplication(completeFormData);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PersonalInfoStep
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        );
      case 1:
        return (
          <DocumentsStep
            formData={formData}
            errors={errors}
            onFileChange={handleFileChange}
          />
        );
      case 2:
        return (
          <AddressStep
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        );
      case 3:
        return (
          <SkillsStep
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        );
      case 4:
        return (
          <BankingStep
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

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
        <div className="bg-white ">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to home</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Left Sidebar */}
        <div className="w-80 bg-white p-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Application Progress
            </h2>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const isCompleted = index < activeStep;
                const isCurrent = index === activeStep;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-100"
                          : isCurrent
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isCompleted
                            ? "text-green-600"
                            : isCurrent
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium text-sm ${
                          isCompleted
                            ? "text-green-900"
                            : isCurrent
                            ? "text-blue-900"
                            : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Application Info
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• All fields marked with * are required</p>
              <p>• Documents should be clear and readable</p>
              <p>• Application will be reviewed within 24-48 hours</p>
              <p>• You&apos;ll receive updates via SMS/Email</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 pt-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">{submitError.message}</p>
              </div>
            )}

            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              <div>
                {activeStep === steps.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
