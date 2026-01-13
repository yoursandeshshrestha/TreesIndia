"use client";

import React from "react";
import { Users, CheckCircle, XCircle, Star } from "lucide-react";

export type WorkerTabType = "all" | "active" | "inactive" | "normal" | "treesindia";

interface WorkerTabsProps {
  activeTab: WorkerTabType;
  onTabChange: (tab: WorkerTabType) => void;
  stats: {
    total: number;
    active: number;
    inactive: number;
    normal: number;
    treesindia: number;
  };
  isLoading?: boolean;
}

const WorkerTabs = ({
  activeTab,
  onTabChange,
  stats,
  isLoading = false,
}: WorkerTabsProps) => {
  const tabs = [
    {
      id: "all" as WorkerTabType,
      label: "All Workers",
      icon: <Users size={16} />,
      count: stats.total,
    },
    {
      id: "active" as WorkerTabType,
      label: "Active",
      icon: <CheckCircle size={16} />,
      count: stats.active,
    },
    {
      id: "inactive" as WorkerTabType,
      label: "Inactive",
      icon: <XCircle size={16} />,
      count: stats.inactive,
    },
    {
      id: "normal" as WorkerTabType,
      label: "Normal",
      icon: <Users size={16} />,
      count: stats.normal,
    },
    {
      id: "treesindia" as WorkerTabType,
      label: "TreesIndia Worker",
      icon: <Star size={16} />,
      count: stats.treesindia,
    },
  ];

  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <div className="flex space-x-8 min-w-max">
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

export default WorkerTabs;
