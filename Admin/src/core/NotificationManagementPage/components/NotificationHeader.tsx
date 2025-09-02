import React from "react";
import { Bell } from "lucide-react";

const NotificationHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="text-blue-600" size={28} />
          Notification Management
        </h1>
        <p className="text-gray-600 mt-2">
          Send push notifications, manage templates, and monitor delivery
          performance
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">2,847</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Active Devices</div>
          <div className="text-2xl font-bold text-green-600">1,923</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Delivery Rate</div>
          <div className="text-2xl font-bold text-blue-600">94.2%</div>
        </div>
      </div>
    </div>
  );
};

export default NotificationHeader;
