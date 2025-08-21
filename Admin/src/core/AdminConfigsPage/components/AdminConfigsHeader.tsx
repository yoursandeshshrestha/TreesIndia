import React from "react";
import { Settings } from "lucide-react";

const AdminConfigsHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              System Configuration
            </h1>
            <p className="text-gray-600">
              Manage system-wide settings and configuration parameters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfigsHeader;
