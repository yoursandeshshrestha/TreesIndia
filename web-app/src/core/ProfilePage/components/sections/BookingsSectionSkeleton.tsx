import React from "react";

export function BookingsSectionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Bookings List Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        <div className="divide-y divide-gray-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
