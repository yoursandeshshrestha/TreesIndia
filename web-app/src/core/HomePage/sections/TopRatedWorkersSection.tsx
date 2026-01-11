"use client";

import { useLocation } from "@/hooks/useLocationRedux";
import { useWorkers } from "@/hooks/useWorkers";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { openChatModalWithUser } from "@/store/slices/chatModalSlice";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { WorkerCard } from "@/commonComponents/WorkerCard/WorkerCard";
import { WorkerFilters } from "@/types/worker";

export default function TopRatedWorkersSection() {
  const router = useRouter();
  const { location, isLoading: locationLoading } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();

  // Create filters for top-rated workers
  const workerFilters: WorkerFilters = {
    page: 1,
    limit: 8,
    is_active: true,
    sortBy: "rating",
    sortOrder: "desc",
    ...(location?.city && { city: location.city }),
    ...(location?.state && { state: location.state }),
  };

  // Use TanStack Query to fetch top-rated workers
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useWorkers(workerFilters);

  const workers = Array.isArray(response?.data?.workers) ? response.data.workers : [];

  const handleWorkerClick = (worker: { ID?: number; id?: number }) => {
    const workerId = worker.ID || worker.id || 0;
    // Validate worker ID before navigation
    if (!workerId || workerId <= 0) {
      console.error("Invalid worker ID:", workerId);
      return;
    }
    // Navigate to worker detail page
    router.push(`/marketplace/workers/${workerId}`);
  };

  const handleViewAllWorkers = () => {
    router.push("/marketplace/workers");
  };

  const handleChatClick = (worker: { user_id: number }) => {
    if (!isAuthenticated || !user) {
      dispatch(openAuthModal({}));
      return;
    }

    dispatch(
      openChatModalWithUser({
        user_1: user.id,
        user_2: worker.user_id,
      })
    );
  };

  const getSectionTitle = () => {
    if (location?.city && location?.state) {
      return `Top Rated Workers in ${location.city}`;
    }
    return "Top Rated Workers";
  };

  if (isLoading || locationLoading) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="h-10 bg-gray-200 rounded w-80 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Don't render the section if there are no workers or if there's an error
  if (workers.length === 0 || isError || error) {
    return null;
  }

  return (
    <section className="px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-semibold text-gray-900 leading-tight">
          {getSectionTitle()}
        </h2>
        <button
          onClick={handleViewAllWorkers}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
        >
          View All Workers
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {workers.map((worker, index) => (
          <WorkerCard
            key={`worker-${worker.ID}-${index}`}
            worker={worker}
            onClick={() => handleWorkerClick(worker)}
            onChatClick={() => handleChatClick(worker)}
            currentUserId={user?.id}
          />
        ))}
      </div>
    </section>
  );
}
