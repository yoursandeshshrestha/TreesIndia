import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Users, Calendar } from "lucide-react";
import type { MonthlyTrends } from "../types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyTrendsChartProps {
  trends: MonthlyTrends | null;
  isLoading?: boolean;
  error?: string | null;
}

const MonthlyTrendsChart: React.FC<MonthlyTrendsChartProps> = ({
  trends,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !trends) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No trend data available</p>
      </div>
    );
  }

  const formatMonth = (monthString: string) => {
    return new Date(monthString).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  const trendCards = [
    {
      title: "Users",
      data: trends.users,
      icon: Users,
      color: "blue",
      formatValue: (value: number) => value.toString(),
    },
    {
      title: "Bookings",
      data: trends.bookings,
      icon: Calendar,
      color: "green",
      formatValue: (value: number) => value.toString(),
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "text-blue-600 bg-blue-100",
      green: "text-green-600 bg-green-100",
      yellow: "text-yellow-600 bg-yellow-100",
      purple: "text-purple-600 bg-purple-100",
      indigo: "text-indigo-600 bg-indigo-100",
      pink: "text-pink-600 bg-pink-100",
      orange: "text-orange-600 bg-orange-100",
      emerald: "text-emerald-600 bg-emerald-100",
      teal: "text-teal-600 bg-teal-100",
      cyan: "text-cyan-600 bg-cyan-100",
      red: "text-red-600 bg-red-100",
    };
    return colorMap[color] || "text-gray-600 bg-gray-100";
  };

  const getChartColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "rgb(59, 130, 246)",
      green: "rgb(16, 185, 129)",
      yellow: "rgb(245, 158, 11)",
      purple: "rgb(139, 92, 246)",
      indigo: "rgb(99, 102, 241)",
      pink: "rgb(236, 72, 153)",
      orange: "rgb(249, 115, 22)",
      emerald: "rgb(16, 185, 129)",
      teal: "rgb(20, 184, 166)",
      cyan: "rgb(6, 182, 212)",
      red: "rgb(239, 68, 68)",
    };
    return colorMap[color] || "rgb(107, 114, 128)";
  };

  return (
    <div className="space-y-6">
      {trendCards.map((trend, index) => {
        if (!trend.data || trend.data.length === 0) return null;

        const Icon = trend.icon;
        const months = trend.data.map((item) => formatMonth(item.month));
        const values = trend.data.map((item) => item.value || item.amount || 0);

        return (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className={`p-2 rounded-lg ${getColorClasses(trend.color)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">
                {trend.title}
              </h3>
            </div>

            <div className="h-64">
              <Line
                data={{
                  labels: months,
                  datasets: [
                    {
                      label: trend.title,
                      data: values,
                      borderColor: getChartColor(trend.color),
                      backgroundColor: getChartColor(trend.color)
                        .replace("rgb", "rgba")
                        .replace(")", ", 0.1)"),
                      tension: 0.4,
                      pointRadius: 3,
                      pointHoverRadius: 5,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: "index" as const,
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `${trend.title}: ${trend.formatValue(
                            context.parsed.y
                          )}`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      display: true,
                      title: {
                        display: true,
                        text: "Month",
                      },
                      grid: {
                        display: true,
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                    },
                    y: {
                      display: true,
                      title: {
                        display: true,
                        text:
                          trend.title === "Revenue" ? "Amount (₹)" : "Count",
                      },
                      grid: {
                        display: true,
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthlyTrendsChart;
