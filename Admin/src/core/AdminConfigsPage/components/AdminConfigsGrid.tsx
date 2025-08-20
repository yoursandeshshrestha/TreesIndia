import React from "react";
import {
  Edit,
  Eye,
  XCircle,
  Settings,
  Wallet,
  Home,
  CreditCard,
  Shield,
  Timer,
  Users,
  FileText,
  Globe,
  Lock,
  Bell,
  Zap,
  Target,
} from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Toggle from "@/components/Toggle";
import { AdminConfig, CONFIG_CATEGORIES } from "../types";
import { cn } from "@/utils/cn";

interface AdminConfigsGridProps {
  configs: AdminConfig[];
  isLoading: boolean;
  error: string | null;
  onEdit: (config: AdminConfig) => void;
  onToggleValue?: (config: AdminConfig, newValue: string) => void;
  onRetry: () => void;
}

const AdminConfigsGrid: React.FC<AdminConfigsGridProps> = ({
  configs,
  isLoading,
  error,
  onEdit,
  onToggleValue,
  onRetry,
}) => {
  const getCategoryIcon = (category: string) => {
    const icons = {
      wallet: <Wallet className="w-5 h-5" />,
      property: <Home className="w-5 h-5" />,
      service: <Settings className="w-5 h-5" />,
      system: <Settings className="w-5 h-5" />,
      payment: <CreditCard className="w-5 h-5" />,
    };
    return (
      icons[category as keyof typeof icons] || <Settings className="w-5 h-5" />
    );
  };

  const getConfigIcon = (key: string, category: string) => {
    // Specific icons for common configurations
    const specificIcons: Record<string, React.ReactNode> = {
      // System configurations
      maintenance_mode: <Shield className="w-6 h-6" />,
      enable_avatar_upload: <Users className="w-6 h-6" />,
      enable_user_registration: <Users className="w-6 h-6" />,
      session_timeout_minutes: <Timer className="w-6 h-6" />,
      max_login_attempts: <Lock className="w-6 h-6" />,
      avatar_max_size_mb: <FileText className="w-6 h-6" />,
      document_max_size_mb: <FileText className="w-6 h-6" />,
      support_email: <Globe className="w-6 h-6" />,
      support_phone: <Globe className="w-6 h-6" />,
      default_language: <Globe className="w-6 h-6" />,
      default_timezone: <Globe className="w-6 h-6" />,
      require_email_verification: <Bell className="w-6 h-6" />,
      require_sms_verification: <Bell className="w-6 h-6" />,

      // Wallet configurations

      min_recharge_amount: <Wallet className="w-6 h-6" />,
      max_recharge_amount: <Wallet className="w-6 h-6" />,

      // Property configurations
      property_expiry_days: <Timer className="w-6 h-6" />,
      max_property_images: <FileText className="w-6 h-6" />,
      auto_approve_broker_properties: <Target className="w-6 h-6" />,
      max_properties_normal: <Home className="w-6 h-6" />,
      max_properties_broker: <Home className="w-6 h-6" />,

      // Payment configurations
      payment_gateway_timeout: <Timer className="w-6 h-6" />,
      enable_payment_retry: <Zap className="w-6 h-6" />,
      payment_currency: <CreditCard className="w-6 h-6" />,
    };

    // Return specific icon if available, otherwise return category icon
    return specificIcons[key] || getCategoryIcon(category);
  };

  const getCategoryLabel = (category: string) => {
    const cat = CONFIG_CATEGORIES.find((c) => c.value === category);
    return cat?.label || category;
  };

  const formatValue = (value: string, type: string) => {
    if (type === "bool") {
      return value === "true" ? "Yes" : "No";
    }
    return value;
  };

  const getValueColor = (value: string, type: string) => {
    if (type === "bool") {
      return value === "true" ? "text-green-600" : "text-red-600";
    }
    return "text-gray-900";
  };

  // Group configurations by category
  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, AdminConfig[]>);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Configurations
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Configurations Found
          </h3>
          <p className="text-gray-600">
            No configurations match your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
        <div key={category}>
          {/* Category Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm ">
                {getCategoryIcon(category)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {getCategoryLabel(category)}
                </h3>
                <p className="text-sm text-gray-600">
                  {categoryConfigs.length} configuration
                  {categoryConfigs.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryConfigs.map((config) => (
              <div
                key={config.ID}
                className={cn(
                  "bg-white rounded-lg p-4 hover:shadow-md transition-all duration-200",
                  config.type === "bool" ? "" : "cursor-pointer"
                )}
                onClick={() => {
                  if (config.type !== "bool") {
                    onEdit(config);
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getConfigIcon(config.key, category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-sm font-medium text-gray-900 break-words leading-tight"
                        title={config.key.replace(/_/g, " ")}
                      >
                        {config.key.replace(/_/g, " ")}
                      </h4>
                      <p className="text-xs text-gray-500">{config.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        config.is_active ? "bg-green-500" : "bg-gray-300"
                      )}
                    ></div>
                    <span className="text-xs text-gray-500">{config.type}</span>
                  </div>
                </div>

                {/* Value */}
                <div className="bg-gray-50 rounded p-2 mb-3">
                  <span className="text-xs text-gray-600">Value:</span>
                  {config.type === "bool" ? (
                    <div className="flex items-center justify-between mt-1">
                      <Toggle
                        checked={config.value === "true"}
                        onChange={() => {
                          if (onToggleValue) {
                            const newValue =
                              config.value === "true" ? "false" : "true";
                            onToggleValue(config, newValue);
                          }
                        }}
                        size="sm"
                      />
                      <span className="text-sm text-gray-600">
                        {config.value === "true" ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-mono ml-1",
                        getValueColor(config.value, config.type)
                      )}
                    >
                      {formatValue(config.value, config.type)}
                    </span>
                  )}
                </div>

                {/* Edit Button - Only for non-boolean configs */}
                {config.type !== "bool" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(config);
                    }}
                    className="w-full text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminConfigsGrid;
