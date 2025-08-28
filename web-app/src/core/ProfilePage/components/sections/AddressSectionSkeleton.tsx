export function AddressSectionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
        </div>
      </div>

      {/* Add Address Button Skeleton */}
      <div className="py-6 border-t border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Address Items Skeleton */}
      <div className="divide-y divide-gray-200">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="py-3">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                {/* Address Name Skeleton */}
                <div className="h-6 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
                
                {/* Address Details Skeleton */}
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
              
              {/* Action Buttons Skeleton */}
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
