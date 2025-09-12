"use client";

import React from "react";
import { Grid, CheckCircle, XCircle } from "lucide-react";
import { VendorTabType, VendorStats } from "../types";

interface VendorTabsProps {
  activeTab: VendorTabType;
  onTabChange: (tab: VendorTabType) => void;
  stats?: VendorStats;
  isLoading?: boolean;
}

const VendorTabs = ({
  activeTab,
  onTabChange,
  stats,
  isLoading = false,
}: VendorTabsProps) => {
  // Safely extract stats with fallbacks
  const totalVendors = stats?.total_vendors ?? 0;
  const activeVendors = stats?.active_vendors ?? 0;
  const inactiveVendors = stats?.inactive_vendors ?? 0;

  const tabs = [
    {
      id: "all" as VendorTabType,
      label: "All Vendors",
      icon: <Grid size={16} />,
      count: totalVendors,
    },
    {
      id: "active" as VendorTabType,
      label: "Active",
      icon: <CheckCircle size={16} />,
      count: activeVendors,
    },
    {
      id: "inactive" as VendorTabType,
      label: "Inactive",
      icon: <XCircle size={16} />,
      count: inactiveVendors,
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.icon}
            {tab.label}
            {!isLoading && (
              <span
                className={`ml-1 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            )}
            {isLoading && (
              <span className="ml-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-400">
                ...
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VendorTabs;
