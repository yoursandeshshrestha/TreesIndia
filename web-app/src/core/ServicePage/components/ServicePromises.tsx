export function ServicePromises() {
  return (
    <div className="w-full xl:w-80 bg-white flex flex-col sticky top-24 h-fit">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
        Promises
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {/* Promises Section */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
          <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
            Our Promises
          </h4>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <span className="text-green-600 mr-2">✓</span>
              <span>TreesInida warranty & damage cover</span>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <span className="text-green-600 mr-2">✓</span>
              <span>100% satisfaction guarantee</span>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <span className="text-green-600 mr-2">✓</span>
              <span>Professional service providers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
