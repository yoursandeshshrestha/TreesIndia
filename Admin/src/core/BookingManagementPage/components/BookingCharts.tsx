import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { Typography } from "@mui/material";
import { TrendingUp, BarChart3 } from "lucide-react";

interface BookingStats {
  revenue_analytics?: {
    last_7_days?: Array<{
      date: string;
      revenue: number;
      bookings: number;
    }>;
  };
  status_breakdown?: Record<string, number>;
}

interface BookingChartsProps {
  stats: BookingStats | null;
}

const BookingCharts: React.FC<BookingChartsProps> = ({ stats }) => {
  if (!stats) return null;

  // Revenue trend data (last 7 days) - use real data from backend
  const revenueData =
    stats.revenue_analytics?.last_7_days?.map((item) => ({
      day: new Date(item.date).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      revenue: item.revenue,
      bookings: item.bookings,
    })) || [];

  // Booking status distribution
  const statusData = Object.entries(stats.status_breakdown || {}).map(
    ([status, count]) => ({
      id: status,
      value: count as number,
      label: status.replace("_", " ").toUpperCase(),
    })
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <Typography
              variant="subtitle1"
              className="text-gray-900 font-medium"
            >
              Revenue Trend (Last 7 Days)
            </Typography>
          </div>
        </div>
        <div className="p-4">
          <LineChart
            xAxis={[
              {
                id: "revenueDays",
                data: revenueData.map((_, index) => index),
                valueFormatter: (index: number) =>
                  revenueData[index]?.day || "",
              },
            ]}
            series={[
              {
                data: revenueData.map((item) => item.revenue),
                area: true,
                color: "#3B82F6",
              },
            ]}
            height={250}
          />
        </div>
      </div>

      {/* Booking Status Distribution */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <Typography
              variant="subtitle1"
              className="text-gray-900 font-medium"
            >
              Booking Status Distribution
            </Typography>
          </div>
        </div>
        <div className="p-4">
          <BarChart
            xAxis={[
              {
                id: "statusDistribution",
                data: statusData.map((_, index) => index),
                valueFormatter: (index: number) =>
                  statusData[index]?.label || "",
              },
            ]}
            series={[
              {
                data: statusData.map((item) => item.value),
                color: "#6B7280",
              },
            ]}
            height={250}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingCharts;
