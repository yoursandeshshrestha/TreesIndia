"use client";

import { useState, useEffect } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export default function OTPForm() {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { verifyOtp, phone, error } = useAuthStore();

  // Watch for errors and clear input
  useEffect(() => {
    if (error) {
      toast.error(error);
      setOtp(""); // Clear the input box
    }
  }, [error]);

  const handleOtpComplete = async (value: string) => {
    if (!phone) return;

    setIsVerifying(true);
    try {
      await verifyOtp(phone, value);
      router.push("/dashboard");
    } catch {
      // Error is handled by the store and shown via useEffect
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!phone) return;

    try {
      await useAuthStore.getState().sendOtp(phone);
      toast.success("OTP resent successfully");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const handleBackToLogin = () => {
    useAuthStore.getState().clearError();
    useAuthStore.setState({ otpSent: false, phone: null });
  };

  return (
    <Card className="w-full md:w-[400px]">
      <CardHeader>
        <CardTitle>Enter Verification Code</CardTitle>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a verification code to {phone}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={4}
            pattern={REGEXP_ONLY_DIGITS}
            value={otp}
            onChange={setOtp}
            onComplete={handleOtpComplete}
            disabled={isVerifying}
          >
            <InputOTPGroup className="space-x-4 *:rounded-lg! *:border!">
              <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
              <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleResendOtp}
            variant="outline"
            disabled={isVerifying}
            className="w-full"
          >
            Resend OTP
          </Button>

          <Button
            onClick={handleBackToLogin}
            variant="ghost"
            disabled={isVerifying}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>

        <p className="text-muted-foreground text-sm text-center">
          You will be automatically redirected after the code is confirmed.
        </p>
      </CardContent>
    </Card>
  );
}
