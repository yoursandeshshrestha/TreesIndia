import React from "react";
import { Home, Building, Truck, Users } from "lucide-react";
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
import { Doughnut, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface PropertyAnalytics {
  total_properties: number;
  active_listings: number;
  properties_this_month: number;
  average_property_price: number;
  property_trends: any;
}

interface ProjectAnalytics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  projects_this_month: number;
  project_trends: any;
}

interface VendorAnalytics {
  total_vendors: number;
  active_vendors: number;
  vendors_this_month: number;
  average_vendor_rating: number;
  vendor_trends: any;
}

interface MarketplaceAnalyticsData {
  property_analytics: PropertyAnalytics;
  project_analytics: ProjectAnalytics;
  vendor_analytics: VendorAnalytics;
}

interface MarketplaceAnalyticsProps {
  data: MarketplaceAnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

const MarketplaceAnalytics: React.FC<MarketplaceAnalyticsProps> = ({
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
        <p>Error loading marketplace analytics: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No marketplace analytics data available</p>
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
      {/* Property Analytics - Pie Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">
            Property Analytics
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex justify-center">
            <div className="w-80 h-80">
              <Pie
                data={{
                  labels: ["Total Properties", "Active Listings", "This Month"],
                  datasets: [
                    {
                      data: [
                        data.property_analytics.total_properties,
                        data.property_analytics.active_listings,
                        data.property_analytics.properties_this_month,
                      ],
                      backgroundColor: [
                        "#3B82F6", // Blue for total
                        "#60A5FA", // Lighter blue for active
                        "#93C5FD", // Lightest blue for this month
                      ],
                      borderColor: [
                        "#2563EB", // Darker blue
                        "#3B82F6", // Blue
                        "#60A5FA", // Lighter blue
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
                }}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Total Properties
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {data.property_analytics.total_properties}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Active Listings
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {data.property_analytics.active_listings}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                This Month
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {data.property_analytics.properties_this_month}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Analytics - Pie Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Building className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">
            Project Analytics
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex justify-center">
            <div className="w-80 h-80">
              <Pie
                data={{
                  labels: ["Total Projects", "Active Projects", "This Month"],
                  datasets: [
                    {
                      data: [
                        data.project_analytics.total_projects,
                        data.project_analytics.active_projects,
                        data.project_analytics.projects_this_month,
                      ],
                      backgroundColor: [
                        "#10B981", // Green for total
                        "#34D399", // Lighter green for active
                        "#6EE7B7", // Lightest green for this month
                      ],
                      borderColor: [
                        "#059669", // Darker green
                        "#10B981", // Green
                        "#34D399", // Lighter green
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
                }}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Total Projects
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {data.project_analytics.total_projects}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Active Projects
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {data.project_analytics.active_projects}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                This Month
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {data.project_analytics.projects_this_month}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Analytics - Pie Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Truck className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">
            Vendor Analytics
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex justify-center">
            <div className="w-80 h-80">
              <Pie
                data={{
                  labels: ["Total Vendors", "Active Vendors", "This Month"],
                  datasets: [
                    {
                      data: [
                        data.vendor_analytics.total_vendors,
                        data.vendor_analytics.active_vendors,
                        data.vendor_analytics.vendors_this_month,
                      ],
                      backgroundColor: [
                        "#F59E0B", // Orange for total
                        "#FBBF24", // Lighter orange for active
                        "#FCD34D", // Lightest orange for this month
                      ],
                      borderColor: [
                        "#D97706", // Darker orange
                        "#F59E0B", // Orange
                        "#FBBF24", // Lighter orange
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
                }}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Total Vendors
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {data.vendor_analytics.total_vendors}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Active Vendors
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {data.vendor_analytics.active_vendors}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                This Month
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {data.vendor_analytics.vendors_this_month}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceAnalytics;
