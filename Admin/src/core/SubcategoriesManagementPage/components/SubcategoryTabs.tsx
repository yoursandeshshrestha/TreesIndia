import React from "react";
import { Home, Hammer, Grid } from "lucide-react";

export type ServiceType = "all" | "home" | "construction";

interface SubcategoryTabsProps {
  activeTab: ServiceType;
  onTabChange: (tab: ServiceType) => void;
  counts: {
    all: number;
    home: number;
    construction: number;
  };
}

const SubcategoryTabs = ({
  activeTab,
  onTabChange,
  counts,
}: SubcategoryTabsProps) => {
  const tabs = [
    {
      id: "all" as ServiceType,
      label: "All",
      icon: <Grid size={16} />,
      count: counts.all,
    },
    {
      id: "home" as ServiceType,
      label: "Home Service",
      icon: <Home size={16} />,
      count: counts.home,
    },
    {
      id: "construction" as ServiceType,
      label: "Construction Service",
      icon: <Hammer size={16} />,
      count: counts.construction,
    },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
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
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryTabs;
