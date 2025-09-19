import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { UserAnalytics as UserAnalyticsType } from "../types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface UserAnalyticsProps {
  data: UserAnalyticsType | null;
  isLoading: boolean;
  error: string | null;
}

const UserAnalytics: React.FC<UserAnalyticsProps> = ({
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
        <p>Error loading user analytics: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No user analytics data available</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "worker":
        return "bg-blue-100 text-blue-800";
      case "normal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-2xl font-semibold text-gray-900">
              {data.active_users}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-600">New This Month</p>
            <p className="text-2xl font-semibold text-gray-900">
              {data.new_users_this_month}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-600">Retention Rate</p>
            <p className="text-2xl font-semibold text-gray-900">
              {data.user_retention_rate}%
            </p>
          </div>
        </div>
      </div>

      {/* User Types Distribution - Donut Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          User Types Distribution
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="flex justify-center">
            <div className="w-64 h-64">
              <Doughnut
                data={{
                  labels: Object.keys(data.user_types_distribution).map(
                    (type) => type.charAt(0).toUpperCase() + type.slice(1)
                  ),
                  datasets: [
                    {
                      data: Object.values(data.user_types_distribution),
                      backgroundColor: [
                        "#EF4444", // Red for admin
                        "#3B82F6", // Blue for worker
                        "#10B981", // Green for normal
                      ],
                      borderColor: [
                        "#DC2626", // Darker red
                        "#2563EB", // Darker blue
                        "#059669", // Darker green
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

          {/* Legend with counts */}
          <div className="flex flex-col justify-center space-y-3">
            {Object.entries(data.user_types_distribution).map(
              ([type, count], index) => {
                const colors = ["#EF4444", "#3B82F6", "#10B981"];
                const total = Object.values(
                  data.user_types_distribution
                ).reduce((a, b) => a + b, 0);
                const percentage =
                  total > 0 ? ((count / total) * 100).toFixed(1) : "0";

                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: colors[index] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        {count}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Users
        </h3>
        <div className="space-y-3">
          {data.recent_users.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name || "Unnamed User"}
                  </p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(
                    user.user_type
                  )}`}
                >
                  {user.user_type}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
