import React from "react";
import { X, Smartphone, Monitor } from "lucide-react";
import { NotificationData } from "../types";
import Button from "@/components/Button/Base/Button";

interface NotificationPreviewProps {
  notification: NotificationData;
  onClose: () => void;
}

const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  notification,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Notification Preview
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mobile Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Smartphone size={16} />
              Mobile Preview
            </div>

            <div className="bg-gray-900 rounded-lg p-4 text-white">
              <div className="flex items-start gap-3">
                {notification.image_url && (
                  <img
                    src={notification.image_url}
                    alt="Notification"
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 truncate">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {notification.body}
                  </p>
                  {notification.data &&
                    Object.keys(notification.data).length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        <div className="font-medium mb-1">Custom Data:</div>
                        {Object.entries(notification.data).map(
                          ([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-gray-500">{key}:</span>
                              <span className="truncate">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Monitor size={16} />
              Desktop Preview
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                {notification.image_url && (
                  <img
                    src={notification.image_url}
                    alt="Notification"
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {notification.body}
                  </p>
                  {notification.data &&
                    Object.keys(notification.data).length > 0 && (
                      <div className="bg-white rounded border p-3 mb-3">
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
                                <span className="truncate">{value}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {notification.click_action && (
                    <div className="text-xs text-blue-600 font-medium">
                      Action: {notification.click_action}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Notification Details
            </h4>

            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">
                  {notification.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Title Length:</span>
                <span className="font-medium">
                  {notification.title.length}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Message Length:</span>
                <span className="font-medium">
                  {notification.body.length}/500
                </span>
              </div>
              {notification.click_action && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Click Action:</span>
                  <span className="font-medium font-mono text-xs">
                    {notification.click_action}
                  </span>
                </div>
              )}
              {notification.data && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Custom Data:</span>
                  <span className="font-medium">
                    {Object.keys(notification.data).length} fields
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreview;
