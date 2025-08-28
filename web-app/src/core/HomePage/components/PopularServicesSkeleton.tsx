export function PopularServicesSkeleton() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Header Section Skeleton */}
      <div className="flex items-center justify-between mb-10">
        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Services Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-xl overflow-hidden">
              {/* Service Image Skeleton */}
              <div className="relative w-full h-60 overflow-hidden rounded-xl">
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
              </div>

              {/* Service Details Skeleton */}
              <div className="p-3">
                {/* Service Name Skeleton */}
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>

                {/* Price Type and Duration Skeleton */}
                <div className="flex items-center justify-between mb-1">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-200 rounded mr-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>

                {/* Price Skeleton */}
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
