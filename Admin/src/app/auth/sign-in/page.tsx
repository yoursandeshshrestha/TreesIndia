"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import CustomInput from "@/components/Input/Base/Input";
import CustomButton from "@/components/Button/Base/Button";
import { useRequestOTP, useVerifyOTP } from "@/services/api/auth";
import { useRouter } from "next/navigation";
import { autoSignOut } from "@/utils/authUtils";

const SignInPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [accessDeniedError, setAccessDeniedError] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);

  const requestOTPMutation = useRequestOTP();
  const verifyOTPMutation = useVerifyOTP();

  // Auto-focus OTP input when step changes to "otp"
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const validatePhone = (phoneNumber: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleRequestOTP = async () => {
    if (!validatePhone(phone)) {
      return;
    }

    // Clear any previous access denied error
    setAccessDeniedError("");

    try {
      const fullPhoneNumber = `+91${phone}`;
      const response = await requestOTPMutation.mutateAsync(fullPhoneNumber);

      if (response.success) {
        setStep("otp");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      return;
    }

    try {
      const fullPhoneNumber = `+91${phone}`;
      const response = await verifyOTPMutation.mutateAsync({
        phone: fullPhoneNumber,
        otp,
      });

      if (response.success) {
        // Check if user is admin
        const user = response.data?.user;
        if (user && user.role === "admin") {
          // Admin user, redirect to dashboard
          router.push("/dashboard");
        } else {
          // Non-admin user, auto sign out and show error
          autoSignOut();
          setAccessDeniedError(
            "Access denied: Admin privileges required. Please contact your administrator."
          );
          setStep("phone");
          setPhone("");
          setOtp("");
        }
      }
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
  };

  const handleResendOTP = async () => {
    await handleRequestOTP();
  };

  const handlePhoneKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRequestOTP();
    }
  };

  const handleOtpKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleVerifyOTP();
    }
  };

  const getErrorMessage = () => {
    if (accessDeniedError) {
      return accessDeniedError;
    }
    if (requestOTPMutation.error) {
      return (
        requestOTPMutation.error.message ||
        "Failed to send OTP. Please try again."
      );
    }
    if (verifyOTPMutation.error) {
      return (
        verifyOTPMutation.error.message ||
        "Failed to verify OTP. Please try again."
      );
    }
    return "";
  };

  const isLoading = requestOTPMutation.isPending || verifyOTPMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {step === "phone" ? "Admin Sign In" : "Enter OTP"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === "phone"
            ? "Enter your admin phone number to receive OTP"
            : `We've sent a 6-digit code to +91${phone}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className=" py-8 px-4  sm:px-10">
          {step === "phone" ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPhone(value.slice(0, 10));
                    }}
                    onKeyPress={handlePhoneKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={10}
                  />
                </div>
                {getErrorMessage() && (
                  <p className="mt-1 text-sm text-red-600">
                    {getErrorMessage()}
                  </p>
                )}
              </div>

              <CustomButton
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                onClick={handleRequestOTP}
                disabled={!phone || phone.length < 10}
              >
                Send OTP
              </CustomButton>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackToPhone}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
                <button
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>

              <CustomInput
                ref={otpInputRef}
                label="Enter 6-digit OTP"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setOtp(value.slice(0, 6));
                }}
                onKeyPress={handleOtpKeyPress}
                leftIcon={<Lock className="w-4 h-4" />}
                error={getErrorMessage()}
                maxLength={6}
              />

              <CustomButton
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6}
              >
                Verify & Sign In
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
