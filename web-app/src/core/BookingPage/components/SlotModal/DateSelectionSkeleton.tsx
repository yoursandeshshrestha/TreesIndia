export function DateSelectionSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="p-3 rounded-lg border border-gray-100 bg-white">
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded mb-2 w-8 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-8 mx-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
