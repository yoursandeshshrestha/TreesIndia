"use client";

import React from "react";

interface CountryCodeDropdownProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export const CountryCodeDropdown: React.FC<CountryCodeDropdownProps> = () => {
  return (
    <div className="flex items-center px-3 py-3 border border-gray-300 rounded-l-lg bg-white">
      <span className="text-sm font-medium text-gray-900">+91</span>
    </div>
  );
};
