import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Lock, ArrowLeft, RefreshCw } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Validation schemas
const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, "Please enter a valid Indian mobile number"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

interface OTPAuthFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const OTPAuthForm: React.FC<OTPAuthFormProps> = ({
  onSuccess,
  redirectTo = "/dashboard",
}) => {
  const router = useRouter();
  const {
    requestOTP,
    login,
    isLoading,
    error,
    clearError,
    isRequestingOTP,
    isLoggingIn,
  } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Phone form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  // OTP form
  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Reset OTP input when error occurs
  useEffect(() => {
    if (error && step === "otp") {
      setOtpValue("");
    }
  }, [error, step]);

  // Handle phone submission
  const handlePhoneSubmit = async (data: PhoneFormData) => {
    try {
      clearError();
      await requestOTP(data.phone);
      setPhoneNumber(data.phone);
      setStep("otp");
      setCountdown(60); // Start 60-second countdown
    } catch (error: unknown) {
      console.error("Failed to request OTP:", error);
      // Error toast is handled by the useAuth hook
    }
  };

  // Handle OTP completion (auto-submit)
  const handleOTPComplete = async (otp: string) => {
    try {
      clearError();
      console.log("Starting OTP verification...");
      await login({ phone: phoneNumber, otp });
      console.log("OTP verification successful, redirecting...");

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Use window.location to ensure proper redirect with new cookies
        console.log("Redirecting to:", redirectTo);
        window.location.href = redirectTo;
      }
    } catch (error: unknown) {
      console.error("Failed to verify OTP:", error);
      // OTP clearing and error toast are handled by the OTPInput component
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      clearError();
      await requestOTP(phoneNumber);
      setCountdown(60);
      setOtpValue("");
      otpForm.reset();
    } catch (error: unknown) {
      console.error("Failed to resend OTP:", error);
      // Error toast is handled by the useAuth hook
    }
  };

  // Handle back to phone step
  const handleBackToPhone = () => {
    setStep("phone");
    setOtpValue("");
    setCountdown(0);
    clearError();
    otpForm.reset();
  };

  if (step === "otp") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Enter OTP</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to{" "}
            <span className="font-medium text-gray-900">{phoneNumber}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="space-y-4">
            <InputOTP
              value={otpValue}
              onChange={(value) => {
                setOtpValue(value);
                if (value.length === 6) {
                  handleOTPComplete(value);
                }
              }}
              maxLength={6}
              disabled={isLoggingIn}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="link"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isRequestingOTP}
              className="p-0 h-auto"
            >
              {isRequestingOTP ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                "Resend OTP"
              )}
            </Button>
          </div>

          {/* Back Button */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleBackToPhone}
            disabled={isLoggingIn}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to phone number
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
          <Phone className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your phone number to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="+91 98765 43210"
              value={phoneForm.watch("phone")}
              onChange={(e) => phoneForm.setValue("phone", e.target.value)}
              className={
                phoneForm.formState.errors.phone ? "border-red-500" : ""
              }
              disabled={isRequestingOTP}
            />
            {phoneForm.formState.errors.phone && (
              <p className="text-sm text-red-600">
                {phoneForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              !phoneForm.watch("phone") ||
              !!phoneForm.formState.errors.phone ||
              isRequestingOTP
            }
          >
            {isRequestingOTP ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>

        {/* Info */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPAuthForm;
