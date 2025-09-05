import React from "react";

export function BookingsSectionSkeleton() {
  return (
    <div className="space-y-4">
      {/* Bookings List Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-50 rounded-lg overflow-hidden">
          <div className="flex">
            {/* Left Side - Status and Service Info */}
            <div className="flex-1 p-6">
              {/* Status Header Skeleton */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
              </div>

              {/* Scheduled Date & Time Skeleton */}
              <div className="rounded-lg mb-6">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
              </div>

              {/* Key Details Skeleton */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-56 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Right Side - Payment and Actions */}
            <div className="w-64 border-l border-gray-200 p-6">
              {/* Payment Info Skeleton */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="space-y-2">
                <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
