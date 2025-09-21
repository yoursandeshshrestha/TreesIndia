import React from "react";
// import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { FinancialAnalytics as FinancialAnalyticsType } from "../types";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface FinancialAnalyticsProps {
  data: FinancialAnalyticsType | null;
  isLoading: boolean;
  error: string | null;
}

const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({
  data,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <p>Error loading financial analytics: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No financial analytics data available</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Revenue This Month
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(data.revenue_this_month)}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total Transactions
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {data.payment_analytics.total_transactions}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <p className="text-xl font-semibold text-gray-900">
              {data.payment_analytics.payment_success_rate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Active Subscriptions
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {data.subscription_analytics.active_subscriptions}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Analytics - Donut Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Analytics
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Success/Failure Donut Chart */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">
              Payment Status
            </h4>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Doughnut
                  data={{
                    labels: ["Successful", "Failed"],
                    datasets: [
                      {
                        data: [
                          data.payment_analytics.successful_payments,
                          data.payment_analytics.failed_payments,
                        ],
                        backgroundColor: ["#10B981", "#EF4444"],
                        borderColor: ["#059669", "#DC2626"],
                        borderWidth: 2,
                        hoverOffset: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                          font: {
                            size: 12,
                          },
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const total = context.dataset.data.reduce(
                              (a: number, b: number) => a + b,
                              0
                            );
                            const percentage = (
                              (context.parsed / total) *
                              100
                            ).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                          },
                        },
                      },
                    },
                    cutout: "60%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">
              Payment Methods
            </h4>
            {Object.keys(data.payment_analytics.payment_method_breakdown)
              .length > 0 ? (
              <div className="flex justify-center">
                <div className="w-64 h-64">
                  <Doughnut
                    data={{
                      labels: Object.keys(
                        data.payment_analytics.payment_method_breakdown
                      ),
                      datasets: [
                        {
                          data: Object.values(
                            data.payment_analytics.payment_method_breakdown
                          ),
                          backgroundColor: [
                            "#3B82F6", // Blue
                            "#10B981", // Green
                            "#F59E0B", // Yellow
                            "#8B5CF6", // Purple
                            "#EC4899", // Pink
                          ],
                          borderColor: [
                            "#2563EB", // Darker blue
                            "#059669", // Darker green
                            "#D97706", // Darker yellow
                            "#7C3AED", // Darker purple
                            "#DB2777", // Darker pink
                          ],
                          borderWidth: 2,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                              size: 12,
                            },
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              const total = context.dataset.data.reduce(
                                (a: number, b: number) => a + b,
                                0
                              );
                              const percentage = (
                                (context.parsed / total) *
                                100
                              ).toFixed(1);
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            },
                          },
                        },
                      },
                      cutout: "60%",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No payment method data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Analytics */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Subscription Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Subscriptions
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {data.subscription_analytics.active_subscriptions}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-600">
                New This Month
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {data.subscription_analytics.new_subscriptions}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-600">Churn Rate</p>
              <p className="text-xl font-semibold text-gray-900">
                {data.subscription_analytics.churn_rate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalytics;
