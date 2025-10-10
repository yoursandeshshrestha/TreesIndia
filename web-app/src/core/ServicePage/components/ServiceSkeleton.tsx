export function ServiceMainContentSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 bg-white">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6">
            <div className="flex-1 w-full">
              {/* Service Name */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-36 sm:w-48 animate-pulse"></div>
              </div>

              {/* Price Type and Duration */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 animate-pulse"></div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 rounded mr-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div>
                </div>
              </div>

              {/* Price */}
              <div className="h-4 sm:h-5 bg-gray-200 rounded w-28 sm:w-32 mb-3 animate-pulse"></div>

              {/* Description */}
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>

              {/* View details link */}
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 animate-pulse"></div>
            </div>

            {/* Right side - Image and Button */}
            <div className="w-full sm:w-auto text-center sm:text-right flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
              {/* Service Image */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-lg sm:mb-3 animate-pulse flex-shrink-0"></div>

              {/* Book Now Button */}
              <div className="flex-1 sm:flex-none sm:w-32 h-9 sm:h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          {i < 2 && (
            <div className="border-t border-gray-200 mt-4 sm:mt-6"></div>
          )}
        </div>
      ))}
    </div>
  );
}
