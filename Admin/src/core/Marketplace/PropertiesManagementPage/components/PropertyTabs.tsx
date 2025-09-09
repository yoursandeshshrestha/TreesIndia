"use client";

import React from "react";
import { Grid, Home, CheckCircle, Shield, Clock } from "lucide-react";
import { PropertyTabType, PropertyStats } from "../types";

interface PropertyTabsProps {
  activeTab: PropertyTabType;
  onTabChange: (tab: PropertyTabType) => void;
  stats?: PropertyStats;
}

const PropertyTabs = ({ activeTab, onTabChange, stats }: PropertyTabsProps) => {
  const tabs = [
    {
      id: "all" as PropertyTabType,
      label: "All Properties",
      icon: <Grid size={16} />,
      count: stats?.total_properties || 0,
    },
    {
      id: "pending" as PropertyTabType,
      label: "Pending",
      icon: <Clock size={16} />,
      count: stats?.pending_properties || 0,
    },
    {
      id: "rented" as PropertyTabType,
      label: "Rented",
      icon: <Home size={16} />,
      count: stats?.rented_properties || 0,
    },
    {
      id: "sold" as PropertyTabType,
      label: "Sold",
      icon: <CheckCircle size={16} />,
      count: stats?.sold_properties || 0,
    },
    {
      id: "treesindia_assured" as PropertyTabType,
      label: "Trees India Assured",
      icon: <Shield size={16} />,
      count: stats?.treesindia_assured_properties || 0,
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
};

export default PropertyTabs;
