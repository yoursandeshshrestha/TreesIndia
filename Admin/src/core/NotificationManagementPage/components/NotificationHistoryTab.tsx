import React, { useState, useEffect } from "react";
import { History, BarChart3, Calendar, Search } from "lucide-react";
import { NotificationHistory } from "../types";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import Select from "@/components/Select/Select";

const NotificationHistoryTab: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    loadNotificationHistory();
  }, []);

  const loadNotificationHistory = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockHistory: NotificationHistory[] = [
        {
          id: "1",
          title: "Welcome to TREESINDIA! 🌳",
          body: "Thank you for joining our platform. We're excited to help you with your home services!",
          type: "system",
          target: "all_users",
          sent_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          delivered_count: 2847,
          failed_count: 23,
          total_count: 2870,
          status: "delivered",
        },
        {
          id: "2",
          title: "✅ Booking Confirmed!",
          body: "Your cleaning service has been confirmed for tomorrow at 2 PM.",
          type: "booking",
          target: "specific_users",
          target_value: "user_123",
          sent_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          delivered_count: 1,
          failed_count: 0,
          total_count: 1,
          status: "delivered",
          data: {
            booking_id: "BK001",
            action: "view_booking",
          },
        },
        {
          id: "3",
          title: "🎉 Special Offer - 20% Off!",
          body: "Get 20% off on your next cleaning service booking. Limited time only!",
          type: "promotional",
          target: "all_users",
          sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          delivered_count: 2756,
          failed_count: 91,
          total_count: 2847,
          status: "delivered",
          data: {
            offer_id: "OFFER001",
            discount: "20%",
          },
        },
        {
          id: "4",
          title: "Test Notification",
          body: "This is a test notification to verify FCM setup",
          type: "test",
          target: "device_tokens",
          target_value: "test_token_123",
          sent_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          delivered_count: 1,
          failed_count: 0,
          total_count: 1,
          status: "delivered",
        },
        {
          id: "5",
          title: "Payment Successful",
          body: "Your payment of ₹500 has been processed successfully.",
          type: "payment",
          target: "specific_users",
          target_value: "user_456",
          sent_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
          delivered_count: 1,
          failed_count: 0,
          total_count: 1,
          status: "delivered",
          data: {
            amount: "₹500",
            transaction_id: "TXN789",
          },
        },
      ];
      setNotifications(mockHistory);
    } catch (error) {
      console.error("Failed to load notification history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      sent: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      scheduled: "bg-yellow-100 text-yellow-800",
    };
    return colors[status as keyof typeof colors] || colors.sent;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      system: "bg-blue-100 text-blue-800",
      booking: "bg-green-100 text-green-800",
      promotional: "bg-purple-100 text-purple-800",
      payment: "bg-yellow-100 text-yellow-800",
      subscription: "bg-indigo-100 text-indigo-800",
      chat: "bg-pink-100 text-pink-800",
      worker_assignment: "bg-orange-100 text-orange-800",
      test: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || colors.system;
  };

  const getDeliveryRate = (delivered: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((delivered / total) * 100);
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || notification.status === statusFilter;
    const matchesType =
      typeFilter === "all" || notification.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Notification History
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            View and analyze your sent notifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <BarChart3 size={16} className="mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Calendar size={16} className="mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notifications..."
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "sent", label: "Sent" },
                { value: "delivered", label: "Delivered" },
                { value: "failed", label: "Failed" },
                { value: "scheduled", label: "Scheduled" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "All Types" },
                { value: "system", label: "System" },
                { value: "booking", label: "Booking" },
                { value: "promotional", label: "Promotional" },
                { value: "payment", label: "Payment" },
                { value: "subscription", label: "Subscription" },
                { value: "chat", label: "Chat" },
                { value: "worker_assignment", label: "Worker Assignment" },
                { value: "test", label: "Test" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Select
              value={dateFilter}
              onChange={setDateFilter}
              options={[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications
                  .reduce((sum, n) => sum + n.total_count, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications
                  .reduce((sum, n) => sum + n.delivered_count, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <BarChart3 className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {notifications
                  .reduce((sum, n) => sum + n.failed_count, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {(() => {
                  const total = notifications.reduce(
                    (sum, n) => sum + n.total_count,
                    0
                  );
                  const delivered = notifications.reduce(
                    (sum, n) => sum + n.delivered_count,
                    0
                  );
                  return total > 0 ? Math.round((delivered / total) * 100) : 0;
                })()}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Notifications ({filteredNotifications.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {notification.type}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          notification.status
                        )}`}
                      >
                        {notification.status}
                      </span>
                    </div>

                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {notification.title}
                    </h4>
                    <p className="text-gray-600 mb-3">{notification.body}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>Target: {notification.target}</span>
                      {notification.target_value && (
                        <span>Value: {notification.target_value}</span>
                      )}
                      <span>
                        Sent: {new Date(notification.sent_at).toLocaleString()}
                      </span>
                    </div>

                    {notification.data &&
                      Object.keys(notification.data).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs font-medium text-gray-700 mb-2">
                            Custom Data:
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(notification.data).map(
                              ([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="text-gray-500 font-medium">
                                    {key}:
                                  </span>
                                  <span>{value}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="ml-6 text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {getDeliveryRate(
                        notification.delivered_count,
                        notification.total_count
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600">
                      {notification.delivered_count.toLocaleString()} /{" "}
                      {notification.total_count.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {notification.failed_count > 0 && (
                        <span className="text-red-600">
                          {notification.failed_count} failed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-8">
                <History className="text-gray-400 mx-auto mb-2" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No notifications have been sent yet"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationHistoryTab;
