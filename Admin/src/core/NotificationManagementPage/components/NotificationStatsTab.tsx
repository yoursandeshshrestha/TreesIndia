import React, { useState, useEffect } from "react";
import { Target, TrendingUp, TrendingDown, BarChart3, Calendar, Download } from "lucide-react";
import { NotificationStats } from "../types";
import Button from "@/components/Button/Base/Button";
import Select from "@/components/Select/Select";

const NotificationStatsTab: React.FC = () => {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockStats: NotificationStats = {
        total_sent: 15420,
        total_delivered: 14580,
        total_failed: 840,
        delivery_rate: 94.6,
        failure_rate: 5.4,
        by_type: {
          system: { sent: 5200, delivered: 4980, failed: 220, rate: 95.8 },
          booking: { sent: 3800, delivered: 3650, failed: 150, rate: 96.1 },
          promotional: { sent: 2800, delivered: 2580, failed: 220, rate: 92.1 },
          payment: { sent: 1200, delivered: 1180, failed: 20, rate: 98.3 },
          subscription: { sent: 800, delivered: 780, failed: 20, rate: 97.5 },
          chat: { sent: 600, delivered: 580, failed: 20, rate: 96.7 },
          worker_assignment: { sent: 500, delivered: 480, failed: 20, rate: 96.0 },
          test: { sent: 520, delivered: 350, failed: 170, rate: 67.3 },
        },
        by_date: [
          { date: "2024-01-01", sent: 120, delivered: 115, failed: 5 },
          { date: "2024-01-02", sent: 135, delivered: 128, failed: 7 },
          { date: "2024-01-03", sent: 110, delivered: 105, failed: 5 },
          { date: "2024-01-04", sent: 145, delivered: 138, failed: 7 },
          { date: "2024-01-05", sent: 130, delivered: 125, failed: 5 },
          { date: "2024-01-06", sent: 125, delivered: 120, failed: 5 },
          { date: "2024-01-07", sent: 140, delivered: 135, failed: 5 },
        ],
      };
      setStats(mockStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      system: "text-blue-600",
      booking: "text-green-600",
      promotional: "text-purple-600",
      payment: "text-yellow-600",
      subscription: "text-indigo-600",
      chat: "text-pink-600",
      worker_assignment: "text-orange-600",
      test: "text-gray-600",
    };
    return colors[type as keyof typeof colors] || colors.system;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="text-green-600" size={16} />;
    } else if (current < previous) {
      return <TrendingDown className="text-red-600" size={16} />;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <Target className="text-gray-400 mx-auto mb-2" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No statistics available</h3>
        <p className="text-gray-600">Statistics will appear here once notifications are sent</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Analytics & Statistics</h3>
          <p className="text-sm text-gray-600 mt-1">
            Monitor notification performance and delivery metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onChange={setTimeRange}
            options={[
              { value: "24h", label: "Last 24 Hours" },
              { value: "7d", label: "Last 7 Days" },
              { value: "30d", label: "Last 30 Days" },
              { value: "90d", label: "Last 90 Days" },
            ]}
          />
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="text-blue-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Total Sent</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.total_sent.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="text-green-600" size={16} />
            <span className="text-green-600">+12.5%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Delivered</span>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.total_delivered.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="text-green-600" size={16} />
            <span className="text-green-600">+8.2%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <BarChart3 className="text-red-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Failed</span>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-2">
            {stats.total_failed.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="text-red-600" size={16} />
            <span className="text-red-600">-15.3%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="text-purple-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Success Rate</span>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.delivery_rate}%
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="text-green-600" size={16} />
            <span className="text-green-600">+2.1%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>
      </div>

      {/* Performance by Type */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance by Notification Type</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {Object.entries(stats.by_type).map(([type, typeStats]) => (
            <div key={type} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)} bg-opacity-10`}>
                    {type}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {typeStats.sent.toLocaleString()} sent
                    </div>
                    <div className="text-sm text-gray-500">
                      {typeStats.delivered.toLocaleString()} delivered • {typeStats.failed.toLocaleString()} failed
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {typeStats.rate}%
                  </div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${typeStats.rate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Trends */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Daily Trends (Last 7 Days)</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {stats.by_date.map((day, index) => (
              <div key={day.date} className="text-center">
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {day.sent}
                </div>
                <div className="text-xs text-gray-500">
                  {day.delivered} delivered
                </div>
                {day.failed > 0 && (
                  <div className="text-xs text-red-500">
                    {day.failed} failed
                  </div>
                )}
                
                {/* Mini Chart Bar */}
                <div className="mt-2 flex items-end justify-center gap-1 h-16">
                  <div className="w-3 bg-blue-200 rounded-t" style={{ height: `${(day.sent / Math.max(...stats.by_date.map(d => d.sent))) * 100}%` }}></div>
                  <div className="w-3 bg-green-200 rounded-t" style={{ height: `${(day.delivered / Math.max(...stats.by_date.map(d => d.delivered))) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">💡 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={16} />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Strong Performance</h4>
              <p className="text-sm text-blue-700">
                Overall delivery rate of {stats.delivery_rate}% shows excellent notification delivery performance.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Target className="text-yellow-600" size={16} />
            </div>
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Test Notifications</h4>
              <p className="text-sm text-yellow-700">
                Test notifications have lower success rate (67.3%). Consider improving test device management.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="text-green-600" size={16} />
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-1">Payment Notifications</h4>
              <p className="text-sm text-green-700">
                Payment notifications achieve highest success rate (98.3%). Excellent user engagement.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="text-purple-600" size={16} />
            </div>
            <div>
              <h4 className="font-medium text-purple-900 mb-1">Consistent Delivery</h4>
              <p className="text-sm text-purple-700">
                Daily delivery rates remain consistent, indicating stable FCM infrastructure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationStatsTab;
