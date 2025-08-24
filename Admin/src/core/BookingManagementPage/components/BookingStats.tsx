import React from "react";
import Button from "@/components/Button/Base/Button";
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface BookingStatsProps {
  stats: any;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onClearError: () => void;
}

const BookingStats: React.FC<BookingStatsProps> = ({
  stats,
  isLoading,
  error,
  onRetry,
  onClearError,
}) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div className="text-red-600">
              <span className="font-medium">Error loading statistics:</span>{" "}
              {error}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onClearError}>
              Dismiss
            </Button>
            <Button size="sm" onClick={onRetry} disabled={isLoading}>
              <RefreshCw
                className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Overview stats
  const overviewStats = [
    {
      title: "Total Bookings",
      value: stats.overview?.total_bookings || 0,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Total Revenue",
      value: `₹${(stats.overview?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Active Workers",
      value: stats.overview?.active_workers || 0,
      icon: Users,
      color: "text-purple-600",
    },
  ];

  // Revenue stats
  const revenueStats = [
    {
      title: "Monthly Revenue",
      value: `₹${(stats.revenue_analytics?.monthly || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Weekly Revenue",
      value: `₹${(stats.revenue_analytics?.weekly || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Daily Revenue",
      value: `₹${(stats.revenue_analytics?.daily || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      title: "Avg. Booking Value",
      value: `₹${(
        stats.revenue_analytics?.average_per_booking || 0
      ).toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {overviewStats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Revenue Analytics
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {revenueStats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStats;
