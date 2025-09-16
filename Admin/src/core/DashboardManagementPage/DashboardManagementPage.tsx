"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { useDashboard } from "./hooks/useDashboard";
import {
  OverviewStats,
  ChartCard,
  MonthlyTrendsChart,
  UserAnalytics,
  FinancialAnalytics,
  MarketplaceAnalytics,
} from "./components";

const DashboardManagementPage = () => {
  const {
    overview,
    userAnalytics,
    bookingAnalytics,
    financialAnalytics,
    marketplaceAnalytics,
    monthlyTrends,
    alerts,
    isLoading,
    isLoadingOverview,
    isLoadingUserAnalytics,
    isLoadingBookingAnalytics,
    isLoadingFinancialAnalytics,
    isLoadingMarketplaceAnalytics,
    isLoadingMonthlyTrends,
    isLoadingAlerts,
    overviewError,
    userAnalyticsError,
    bookingAnalyticsError,
    financialAnalyticsError,
    marketplaceAnalyticsError,
    monthlyTrendsError,
    alertsError,
    refreshAll,
  } = useDashboard();

  const handleRefresh = () => {
    refreshAll();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor your platform performance and key metrics
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 text-gray-600 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
                <span className="text-sm text-gray-700">Refresh All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Banners - Show individual errors */}
        {overviewError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-red-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading overview data
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {overviewError.message}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {userAnalyticsError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-red-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading user analytics
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {userAnalyticsError.message}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {monthlyTrendsError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-red-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading monthly trends
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {monthlyTrendsError.message}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {alertsError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-red-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading alerts
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {alertsError.message}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Show sections as data loads */}
        <div className="space-y-8">
          {/* Overview Statistics - Show immediately if data is available */}
          {(overview?.overview_stats || isLoadingOverview) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Overview Statistics
                </h2>
                {isLoadingOverview && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Loading...
                  </div>
                )}
              </div>
              <OverviewStats
                stats={overview?.overview_stats || null}
                isLoading={isLoadingOverview}
                error={overviewError?.message || null}
              />
            </div>
          )}

          {/* Charts Section - Show as data becomes available */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Trends Chart */}
            {(monthlyTrends || isLoadingMonthlyTrends) && (
              <ChartCard
                title="Monthly Trends"
                isLoading={isLoadingMonthlyTrends}
                error={monthlyTrendsError?.message || null}
              >
                <MonthlyTrendsChart
                  trends={(monthlyTrends as any) || null}
                  isLoading={isLoadingMonthlyTrends}
                  error={monthlyTrendsError?.message || null}
                />
              </ChartCard>
            )}

            {/* User Analytics */}
            {(userAnalytics || isLoadingUserAnalytics) && (
              <ChartCard
                title="User Analytics"
                isLoading={isLoadingUserAnalytics}
                error={userAnalyticsError?.message || null}
              >
                <UserAnalytics
                  data={userAnalytics as any}
                  isLoading={isLoadingUserAnalytics}
                  error={userAnalyticsError?.message || null}
                />
              </ChartCard>
            )}
          </div>

          {/* Financial Analytics - Full Width */}
          {(financialAnalytics || isLoadingFinancialAnalytics) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Financial Analytics
                </h2>
                {isLoadingFinancialAnalytics && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Loading...
                  </div>
                )}
              </div>
              <FinancialAnalytics
                data={financialAnalytics as any}
                isLoading={isLoadingFinancialAnalytics}
                error={financialAnalyticsError?.message || null}
              />
            </div>
          )}

          {/* Marketplace Analytics */}
          {(marketplaceAnalytics || isLoadingMarketplaceAnalytics) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Marketplace Analytics
                </h2>
                {isLoadingMarketplaceAnalytics && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Loading...
                  </div>
                )}
              </div>
              <MarketplaceAnalytics
                data={marketplaceAnalytics as any}
                isLoading={isLoadingMarketplaceAnalytics}
                error={marketplaceAnalyticsError?.message || null}
              />
            </div>
          )}

          {/* Show loading state if no data is available yet */}
          {!overview &&
            !userAnalytics &&
            !financialAnalytics &&
            !marketplaceAnalytics &&
            !monthlyTrends &&
            !alerts &&
            isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            )}

          {/* Show message if no data is available and not loading */}
          {!overview &&
            !userAnalytics &&
            !financialAnalytics &&
            !marketplaceAnalytics &&
            !monthlyTrends &&
            !alerts &&
            !isLoading &&
            !overviewError &&
            !userAnalyticsError &&
            !financialAnalyticsError &&
            !marketplaceAnalyticsError &&
            !monthlyTrendsError &&
            !alertsError && (
              <div className="text-center py-12">
                <p className="text-gray-500">No dashboard data available</p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Load Dashboard Data
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DashboardManagementPage;
