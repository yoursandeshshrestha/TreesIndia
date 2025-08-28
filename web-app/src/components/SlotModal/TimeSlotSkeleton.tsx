export function TimeSlotSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="p-3 rounded-lg border border-gray-100 bg-white">
            <div className="text-center">
              <div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
