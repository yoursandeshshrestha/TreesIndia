"use client";

import { Building, Home, Store, Wrench } from "lucide-react";
import { ProjectTabType, ProjectStats } from "../types";

interface ProjectTabsProps {
  activeTab: ProjectTabType;
  onTabChange: (tab: ProjectTabType) => void;
  stats?: ProjectStats;
}

export default function ProjectTabs({
  activeTab,
  onTabChange,
  stats,
}: ProjectTabsProps) {
  const tabs = [
    {
      id: "all" as ProjectTabType,
      label: "All Projects",
      icon: <Building size={16} />,
      count: stats?.total || 0,
    },
    {
      id: "residential" as ProjectTabType,
      label: "Residential",
      icon: <Home size={16} />,
      count: stats?.residential || 0,
    },
    {
      id: "commercial" as ProjectTabType,
      label: "Commercial",
      icon: <Store size={16} />,
      count: stats?.commercial || 0,
    },
    {
      id: "infrastructure" as ProjectTabType,
      label: "Infrastructure",
      icon: <Wrench size={16} />,
      count: stats?.infrastructure || 0,
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
