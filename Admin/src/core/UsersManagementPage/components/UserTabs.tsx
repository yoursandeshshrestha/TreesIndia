"use client";

import React from "react";
import { Users, Briefcase, Building2, Shield, User } from "lucide-react";

export type UserTabType = "all" | "worker" | "broker" | "admin" | "normal";

interface UserTabsProps {
  activeTab: UserTabType;
  onTabChange: (tab: UserTabType) => void;
  stats: {
    total: number;
    workers: number;
    brokers: number;
    admins: number;
    normal: number;
  };
  isLoading?: boolean;
}

const UserTabs = ({
  activeTab,
  onTabChange,
  stats,
  isLoading = false,
}: UserTabsProps) => {
  const tabs = [
    {
      id: "all" as UserTabType,
      label: "All Users",
      icon: <Users size={16} />,
      count: stats.total,
    },
    {
      id: "normal" as UserTabType,
      label: "Normal",
      icon: <User size={16} />,
      count: stats.normal,
    },
    {
      id: "worker" as UserTabType,
      label: "Workers",
      icon: <Briefcase size={16} />,
      count: stats.workers,
    },
    {
      id: "broker" as UserTabType,
      label: "Brokers",
      icon: <Building2 size={16} />,
      count: stats.brokers,
    },
    {
      id: "admin" as UserTabType,
      label: "Admins",
      icon: <Shield size={16} />,
      count: stats.admins,
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

export default UserTabs;
