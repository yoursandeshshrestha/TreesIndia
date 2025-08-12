"use client";

import { useAuthStore } from "@/store/auth-store";
import { LoginForm } from "@/components/ui/signin-form";
import OTPForm from "@/components/ui/sign-in-input";

export default function SignInPage() {
  const { otpSent } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {otpSent ? (
          <OTPForm />
        ) : (
          <>
            <LoginForm />
          </>
        )}
      </div>
    </div>
  );
}
