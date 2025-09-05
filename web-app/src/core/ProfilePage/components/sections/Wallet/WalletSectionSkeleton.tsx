export function WalletSectionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* Wallet Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Section Skeleton */}
      <div>
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>

        {/* Transaction Items Skeleton */}
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="py-3">
              <div className="flex items-start space-x-3">
                {/* Transaction Icon Skeleton */}
                <div className="w-4 h-4 bg-gray-200 rounded mt-1 animate-pulse"></div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Transaction Type and Status Skeleton */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>

                      {/* Transaction Description Skeleton */}
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>

                    {/* Amount Skeleton */}
                    <div className="text-right ml-4">
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
