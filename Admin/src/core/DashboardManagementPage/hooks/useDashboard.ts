import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useDashboard as useDashboardQuery } from "../services/dashboardApi";
import type { DashboardOverview, DashboardAlerts } from "../types";

interface UseDashboardReturn {
  // Data
  overview: DashboardOverview | null;
  userAnalytics: unknown;
  bookingAnalytics: unknown;
  financialAnalytics: unknown;
  marketplaceAnalytics: unknown;
  monthlyTrends: unknown;
  alerts: DashboardAlerts | null;

  // Loading states
  isLoading: boolean;
  isLoadingOverview: boolean;
  isLoadingUserAnalytics: boolean;
  isLoadingBookingAnalytics: boolean;
  isLoadingFinancialAnalytics: boolean;
  isLoadingMarketplaceAnalytics: boolean;
  isLoadingMonthlyTrends: boolean;
  isLoadingAlerts: boolean;

  // Error states
  overviewError: Error | null;
  userAnalyticsError: Error | null;
  bookingAnalyticsError: Error | null;
  financialAnalyticsError: Error | null;
  marketplaceAnalyticsError: Error | null;
  monthlyTrendsError: Error | null;
  alertsError: Error | null;
  hasError: boolean;

  // Actions
  refreshAll: () => void;
  refreshOverview: () => void;
  refreshUserAnalytics: () => void;
  refreshBookingAnalytics: () => void;
  refreshFinancialAnalytics: () => void;
  refreshMarketplaceAnalytics: () => void;
  refreshMonthlyTrends: () => void;
  refreshAlerts: () => void;
  clearErrors: () => void;
}

export const useDashboard = (): UseDashboardReturn => {
  const [errors, setErrors] = useState<{
    overview: Error | null;
    userAnalytics: Error | null;
    bookingAnalytics: Error | null;
    financialAnalytics: Error | null;
    marketplaceAnalytics: Error | null;
    monthlyTrends: Error | null;
    alerts: Error | null;
  }>({
    overview: null,
    userAnalytics: null,
    bookingAnalytics: null,
    financialAnalytics: null,
    marketplaceAnalytics: null,
    monthlyTrends: null,
    alerts: null,
  });

  // Use the React Query hook
  const {
    overview,
    userAnalytics,
    bookingAnalytics,
    financialAnalytics,
    marketplaceAnalytics,
    monthlyTrends,
    alerts,
    isLoadingOverview,
    isLoadingUserAnalytics,
    isLoadingBookingAnalytics,
    isLoadingFinancialAnalytics,
    isLoadingMarketplaceAnalytics,
    isLoadingMonthlyTrends,
    isLoadingAlerts,
    isLoading,
    overviewError,
    userAnalyticsError,
    bookingAnalyticsError,
    financialAnalyticsError,
    marketplaceAnalyticsError,
    monthlyTrendsError,
    alertsError,
    hasError,
    refreshAll,
    refreshOverview,
    refreshUserAnalytics,
    refreshBookingAnalytics,
    refreshFinancialAnalytics,
    refreshMarketplaceAnalytics,
    refreshMonthlyTrends,
    refreshAlerts,
  } = useDashboardQuery();

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({
      overview: null,
      userAnalytics: null,
      bookingAnalytics: null,
      financialAnalytics: null,
      marketplaceAnalytics: null,
      monthlyTrends: null,
      alerts: null,
    });
  }, []);

  // Enhanced refresh with error handling
  const handleRefreshAll = useCallback(() => {
    try {
      refreshAll();
      toast.success("Dashboard data refreshed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to refresh dashboard data";
      toast.error(errorMessage);
    }
  }, [refreshAll]);

  const handleRefreshOverview = useCallback(() => {
    try {
      refreshOverview();
      toast.success("Overview data refreshed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to refresh overview data";
      toast.error(errorMessage);
    }
  }, [refreshOverview]);

  const handleRefreshAlerts = useCallback(() => {
    try {
      refreshAlerts();
      toast.success("Alerts refreshed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh alerts";
      toast.error(errorMessage);
    }
  }, [refreshAlerts]);

  return {
    // Data
    overview,
    userAnalytics,
    bookingAnalytics,
    financialAnalytics,
    marketplaceAnalytics,
    monthlyTrends,
    alerts,

    // Loading states
    isLoading,
    isLoadingOverview,
    isLoadingUserAnalytics,
    isLoadingBookingAnalytics,
    isLoadingFinancialAnalytics,
    isLoadingMarketplaceAnalytics,
    isLoadingMonthlyTrends,
    isLoadingAlerts,

    // Error states
    overviewError,
    userAnalyticsError,
    bookingAnalyticsError,
    financialAnalyticsError,
    marketplaceAnalyticsError,
    monthlyTrendsError,
    alertsError,
    hasError,

    // Actions
    refreshAll: handleRefreshAll,
    refreshOverview: handleRefreshOverview,
    refreshUserAnalytics,
    refreshBookingAnalytics,
    refreshFinancialAnalytics,
    refreshMarketplaceAnalytics,
    refreshMonthlyTrends,
    refreshAlerts: handleRefreshAlerts,
    clearErrors,
  };
};
