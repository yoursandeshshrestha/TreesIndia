export function BookingPageSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      {/* Service Header Skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Service Name Skeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>

          {/* Service Description Skeleton */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>

          {/* Service Tags Skeleton */}
          <div className="flex items-center gap-3">
            {/* Price Type Badge Skeleton */}
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>

            {/* Duration Skeleton */}
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>

        {/* Price Skeleton */}
        <div className="text-right">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>

      {/* Service Details Section Skeleton */}
      <div className="space-y-4">
        {/* Section Title Skeleton */}
        <div className="h-5 bg-gray-200 rounded w-32"></div>

        {/* Content Lines Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>

      {/* Additional Sections Skeleton */}
      <div className="mt-6 space-y-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 bg-gray-200 rounded w-40"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
