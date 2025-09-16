import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  DashboardOverviewResponse,
  DashboardAlertsResponse,
} from "../types";

// API endpoints
const DASHBOARD_ENDPOINTS = {
  overview: "/admin/dashboard/overview",
  userAnalytics: "/admin/dashboard/user-analytics",
  bookingAnalytics: "/admin/dashboard/booking-analytics",
  financialAnalytics: "/admin/dashboard/financial-analytics",
  marketplaceAnalytics: "/admin/dashboard/marketplace-analytics",
  monthlyTrends: "/admin/dashboard/monthly-trends",
  alerts: "/admin/dashboard/alerts",
} as const;

// Query keys
export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  overview: () => [...dashboardQueryKeys.all, "overview"] as const,
  userAnalytics: () => [...dashboardQueryKeys.all, "userAnalytics"] as const,
  bookingAnalytics: () =>
    [...dashboardQueryKeys.all, "bookingAnalytics"] as const,
  financialAnalytics: () =>
    [...dashboardQueryKeys.all, "financialAnalytics"] as const,
  marketplaceAnalytics: () =>
    [...dashboardQueryKeys.all, "marketplaceAnalytics"] as const,
  monthlyTrends: () => [...dashboardQueryKeys.all, "monthlyTrends"] as const,
  alerts: () => [...dashboardQueryKeys.all, "alerts"] as const,
};

// Dashboard API functions
export const dashboardApi = {
  // Get basic dashboard overview (stats and system health only)
  getOverview: async (): Promise<DashboardOverviewResponse> => {
    return api.get<DashboardOverviewResponse>(DASHBOARD_ENDPOINTS.overview);
  },

  // Get user analytics
  getUserAnalytics: async (): Promise<{
    success: boolean;
    message: string;
    data: unknown;
  }> => {
    return api.get(DASHBOARD_ENDPOINTS.userAnalytics);
  },

  // Get booking analytics
  getBookingAnalytics: async (): Promise<{
    success: boolean;
    message: string;
    data: unknown;
  }> => {
    return api.get(DASHBOARD_ENDPOINTS.bookingAnalytics);
  },

  // Get financial analytics
  getFinancialAnalytics: async (): Promise<{
    success: boolean;
    message: string;
    data: unknown;
  }> => {
    return api.get(DASHBOARD_ENDPOINTS.financialAnalytics);
  },

  // Get marketplace analytics
  getMarketplaceAnalytics: async (): Promise<{
    success: boolean;
    message: string;
    data: unknown;
  }> => {
    return api.get(DASHBOARD_ENDPOINTS.marketplaceAnalytics);
  },

  // Get monthly trends
  getMonthlyTrends: async (): Promise<{
    success: boolean;
    message: string;
    data: unknown;
  }> => {
    return api.get(DASHBOARD_ENDPOINTS.monthlyTrends);
  },

  // Get dashboard alerts and notifications
  getAlerts: async (): Promise<DashboardAlertsResponse> => {
    return api.get<DashboardAlertsResponse>(DASHBOARD_ENDPOINTS.alerts);
  },
};

// React Query hooks with optimized settings for faster loading
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.overview(),
    queryFn: dashboardApi.getOverview,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for faster updates)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Faster retry
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch on mount for fresh data
  });
};

export const useUserAnalytics = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.userAnalytics(),
    queryFn: dashboardApi.getUserAnalytics,
    staleTime: 1 * 60 * 1000, // 1 minute (user data changes frequently)
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useBookingAnalytics = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.bookingAnalytics(),
    queryFn: dashboardApi.getBookingAnalytics,
    staleTime: 30 * 1000, // 30 seconds (bookings change frequently)
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useFinancialAnalytics = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.financialAnalytics(),
    queryFn: dashboardApi.getFinancialAnalytics,
    staleTime: 1 * 60 * 1000, // 1 minute (financial data changes frequently)
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useMarketplaceAnalytics = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.marketplaceAnalytics(),
    queryFn: dashboardApi.getMarketplaceAnalytics,
    staleTime: 2 * 60 * 1000, // 2 minutes (marketplace data changes less frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useMonthlyTrends = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.monthlyTrends(),
    queryFn: dashboardApi.getMonthlyTrends,
    staleTime: 5 * 60 * 1000, // 5 minutes (trends change less frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.alerts(),
    queryFn: dashboardApi.getAlerts,
    staleTime: 30 * 1000, // 30 seconds (alerts should be very fresh)
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Faster retry
    refetchOnWindowFocus: true, // Alerts should refetch on focus
    refetchInterval: 1 * 60 * 1000, // Refetch every 1 minute
    refetchOnMount: true, // Always refetch on mount for fresh data
  });
};

// Combined hook for all dashboard data
export const useDashboard = () => {
  const queryClient = useQueryClient();

  // Get all dashboard data
  const overviewQuery = useDashboardOverview();
  const userAnalyticsQuery = useUserAnalytics();
  const bookingAnalyticsQuery = useBookingAnalytics();
  const financialAnalyticsQuery = useFinancialAnalytics();
  const marketplaceAnalyticsQuery = useMarketplaceAnalytics();
  const monthlyTrendsQuery = useMonthlyTrends();
  const alertsQuery = useDashboardAlerts();

  // Refresh all dashboard data
  const refreshAll = () => {
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.all,
    });
  };

  // Refresh specific data
  const refreshOverview = () => {
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.overview(),
    });
  };

  const refreshUserAnalytics = () => {
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.userAnalytics(),
    });
  };

  const refreshBookingAnalytics = () => {
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.bookingAnalytics(),
    });
  };

  const refreshFinancialAnalytics = () => {
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.financialAnalytics(),
    });
  };

  const refreshMarketplaceAnalytics = () => {
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.marketplaceAnalytics(),
    });
  };

  const refreshMonthlyTrends = () => {
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.monthlyTrends(),
    });
  };

  const refreshAlerts = () => {
    queryClient.invalidateQueries({
      queryKey: dashboardQueryKeys.alerts(),
    });
  };

  return {
    // Data
    overview: overviewQuery.data?.data,
    userAnalytics: userAnalyticsQuery.data?.data,
    bookingAnalytics: bookingAnalyticsQuery.data?.data,
    financialAnalytics: financialAnalyticsQuery.data?.data,
    marketplaceAnalytics: marketplaceAnalyticsQuery.data?.data,
    monthlyTrends: monthlyTrendsQuery.data?.data,
    alerts: alertsQuery.data?.data,

    // Loading states
    isLoadingOverview: overviewQuery.isLoading,
    isLoadingUserAnalytics: userAnalyticsQuery.isLoading,
    isLoadingBookingAnalytics: bookingAnalyticsQuery.isLoading,
    isLoadingFinancialAnalytics: financialAnalyticsQuery.isLoading,
    isLoadingMarketplaceAnalytics: marketplaceAnalyticsQuery.isLoading,
    isLoadingMonthlyTrends: monthlyTrendsQuery.isLoading,
    isLoadingAlerts: alertsQuery.isLoading,
    isLoading:
      overviewQuery.isLoading ||
      userAnalyticsQuery.isLoading ||
      bookingAnalyticsQuery.isLoading ||
      financialAnalyticsQuery.isLoading ||
      marketplaceAnalyticsQuery.isLoading ||
      monthlyTrendsQuery.isLoading ||
      alertsQuery.isLoading,

    // Error states
    overviewError: overviewQuery.error,
    userAnalyticsError: userAnalyticsQuery.error,
    bookingAnalyticsError: bookingAnalyticsQuery.error,
    financialAnalyticsError: financialAnalyticsQuery.error,
    marketplaceAnalyticsError: marketplaceAnalyticsQuery.error,
    monthlyTrendsError: monthlyTrendsQuery.error,
    alertsError: alertsQuery.error,
    hasError:
      overviewQuery.isError ||
      userAnalyticsQuery.isError ||
      bookingAnalyticsQuery.isError ||
      financialAnalyticsQuery.isError ||
      marketplaceAnalyticsQuery.isError ||
      monthlyTrendsQuery.isError ||
      alertsQuery.isError,

    // Actions
    refreshAll,
    refreshOverview,
    refreshUserAnalytics,
    refreshBookingAnalytics,
    refreshFinancialAnalytics,
    refreshMarketplaceAnalytics,
    refreshMonthlyTrends,
    refreshAlerts,

    // Query objects for advanced usage
    overviewQuery,
    userAnalyticsQuery,
    bookingAnalyticsQuery,
    financialAnalyticsQuery,
    marketplaceAnalyticsQuery,
    monthlyTrendsQuery,
    alertsQuery,
  };
};
