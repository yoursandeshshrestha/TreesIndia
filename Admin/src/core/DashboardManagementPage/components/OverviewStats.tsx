import React from "react";
import {
  Users,
  Calendar,
  Banknote,
  Package,
  Home,
  Building,
  Truck,
  UserCheck,
  Shield,
  CreditCard,
} from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import StatsCard from "./StatsCard";
import type { OverviewStats } from "../types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface OverviewStatsProps {
  stats: OverviewStats | null;
  isLoading?: boolean;
  error?: string | null;
}

const OverviewStatsComponent: React.FC<OverviewStatsProps> = ({
  stats,
  isLoading = false,
  error = null,
}) => {
  const statsCards = [
    {
      title: "Total Users",
      value: stats?.total_users || 0,
      icon: Users,
      trend: stats?.total_users ? { value: 12, isPositive: true } : undefined,
    },
    {
      title: "Total Bookings",
      value: stats?.total_bookings || 0,
      icon: Calendar,
      trend: stats?.total_bookings ? { value: 8, isPositive: true } : undefined,
    },
    {
      title: "Total Revenue",
      value: stats?.total_revenue
        ? `₹${stats.total_revenue.toLocaleString()}`
        : "₹0",
      icon: Banknote,
      trend: stats?.total_revenue ? { value: 15, isPositive: true } : undefined,
    },
    {
      title: "Active Services",
      value: stats?.active_services || 0,
      icon: Package,
    },
    {
      title: "Total Properties",
      value: stats?.total_properties || 0,
      icon: Home,
    },
    {
      title: "Total Projects",
      value: stats?.total_projects || 0,
      icon: Building,
    },
    {
      title: "Total Vendors",
      value: stats?.total_vendors || 0,
      icon: Truck,
    },
    {
      title: "Total Workers",
      value: stats?.total_workers || 0,
      icon: UserCheck,
    },
    {
      title: "Total Brokers",
      value: stats?.total_brokers || 0,
      icon: Shield,
    },
    {
      title: "Active Subscriptions",
      value: stats?.active_subscriptions || 0,
      icon: CreditCard,
    },
  ];

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsCards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            error={error}
            isLoading={false}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsCards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Key Metrics Distribution - Donut Chart */}
      {stats && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Key Metrics Distribution
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Doughnut
                  data={{
                    labels: [
                      "Users",
                      "Bookings",
                      "Properties",
                      "Projects",
                      "Vendors",
                    ],
                    datasets: [
                      {
                        data: [
                          stats.total_users,
                          stats.total_bookings,
                          stats.total_properties,
                          stats.total_projects,
                          stats.total_vendors,
                        ],
                        backgroundColor: [
                          "#3B82F6", // Blue for users
                          "#10B981", // Green for bookings
                          "#F59E0B", // Yellow for properties
                          "#8B5CF6", // Purple for projects
                          "#EC4899", // Pink for vendors
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
                        display: false,
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
              {[
                { type: "Users", count: stats.total_users, color: "#3B82F6" },
                {
                  type: "Bookings",
                  count: stats.total_bookings,
                  color: "#10B981",
                },
                {
                  type: "Properties",
                  count: stats.total_properties,
                  color: "#F59E0B",
                },
                {
                  type: "Projects",
                  count: stats.total_projects,
                  color: "#8B5CF6",
                },
                {
                  type: "Vendors",
                  count: stats.total_vendors,
                  color: "#EC4899",
                },
              ].map((item, index) => {
                const total =
                  stats.total_users +
                  stats.total_bookings +
                  stats.total_properties +
                  stats.total_projects +
                  stats.total_vendors;
                const percentage =
                  total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        {item.count}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewStatsComponent;
