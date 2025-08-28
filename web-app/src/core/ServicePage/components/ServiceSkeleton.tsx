export function ServiceMainContentSkeleton() {
  return (
    <div className="space-y-6 bg-white">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Service Name */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>

              {/* Price Type and Duration */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 rounded mr-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>

              {/* Price */}
              <div className="h-5 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>

              {/* Description */}
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>

              {/* View details link */}
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>

            {/* Right side - Image and Button */}
            <div className="ml-6 text-center">
              {/* Service Image */}
              <div className="w-32 h-32 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>

              {/* Book Now Button */}
              <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          {i < 2 && <div className="border-t border-gray-200 mt-6"></div>}
        </div>
      ))}
    </div>
  );
}
