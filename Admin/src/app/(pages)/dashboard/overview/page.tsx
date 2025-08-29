"use client";

import React from "react";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { Shield, Users, Settings, Activity } from "lucide-react";

const DashboardOverviewPage = () => {
  const { isAdmin, user, isLoading } = useAdminAccess();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <h1>Dashboard Overview</h1>
    </div>
  );
};

export default DashboardOverviewPage;
