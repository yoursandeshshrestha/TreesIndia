"use client";

import React from "react";
import OTPAuthForm from "@/components/auth/OTPAuthForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TREESINDIA</h1>
          <p className="text-gray-600">Admin Panel</p>
        </div>

        {/* Auth Form */}
        <OTPAuthForm redirectTo="/dashboard" />

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © 2024 TREESINDIA. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
