"use client";

import { useState } from "react";
import { Home } from "lucide-react";
import HeroSectionTab from "./components/HeroSectionTab";

type TabType = "hero";

function WebsiteManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("hero");

  const tabs = [
    {
      id: "hero" as TabType,
      label: "Hero Section",
      icon: <Home size={16} />,
      description: "Manage hero text, images, and category icons",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Website Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your website&apos;s hero section and category icons
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{activeTab === "hero" && <HeroSectionTab />}</div>
    </div>
  );
}

export default WebsiteManagementPage;
