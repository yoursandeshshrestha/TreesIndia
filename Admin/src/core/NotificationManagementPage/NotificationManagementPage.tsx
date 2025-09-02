"use client";

import React, { useState } from "react";
import { Send, Target, History, Settings } from "lucide-react";

// Components
import NotificationHeader from "./components/NotificationHeader";
import NotificationTabs from "./components/NotificationTabs";
import SendNotificationTab from "./components/SendNotificationTab";
import NotificationHistoryTab from "./components/NotificationHistoryTab";
import NotificationStatsTab from "./components/NotificationStatsTab";
import NotificationSettingsTab from "./components/NotificationSettingsTab";

type TabType = "send" | "history" | "stats" | "settings";

function NotificationManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("send");

  const tabs = [
    {
      id: "send" as TabType,
      label: "Send Notifications",
      icon: <Send size={16} />,
      description: "Send push notifications to users",
    },
    {
      id: "history" as TabType,
      label: "Notification History",
      icon: <History size={16} />,
      description: "View sent notifications and delivery status",
    },
    {
      id: "stats" as TabType,
      label: "Analytics & Stats",
      icon: <Target size={16} />,
      description: "View notification performance metrics",
    },
    {
      id: "settings" as TabType,
      label: "Notification Settings",
      icon: <Settings size={16} />,
      description: "Configure notification preferences and templates",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <NotificationHeader />

      {/* Tabs */}
      <NotificationTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "send" && <SendNotificationTab />}
        {activeTab === "history" && <NotificationHistoryTab />}
        {activeTab === "stats" && <NotificationStatsTab />}
        {activeTab === "settings" && <NotificationSettingsTab />}
      </div>
    </div>
  );
}

export default NotificationManagementPage;
