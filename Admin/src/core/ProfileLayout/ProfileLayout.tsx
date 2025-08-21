"use client";

import React from "react";
import { User, Shield } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isProfileActive = pathname === "/dashboard/profile";
  const isSecurityActive = pathname === "/dashboard/profile/security";

  return (
    <div className="flex justify-start items-start bg-[#f8f8f8] font-mono text-[#212126] text-[13px] leading-[18px] tracking-[0px] h-[60vh]">
      <div className="bg-[#f8f8f8] rounded-lg shadow-md border border-gray-200 w-full max-w-4xl h-full">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-auto  p-4">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#212126] mb-2">
                Account
              </h1>
              <p className="text-sm text-gray-600 text-nowrap">
                Manage your account info.
              </p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => router.push("/dashboard/profile")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                  isProfileActive
                    ? "bg-[#e7e7e7] text-[#212126]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => router.push("/dashboard/profile/security")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                  isSecurityActive
                    ? "bg-[#e7e7e7] text-[#212126]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </button>
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1 border-l border-gray-200 bg-white p-6 overflow-y-auto rounded-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
