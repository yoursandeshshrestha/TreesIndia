"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Worker, WorkerFilters } from "@/types/worker";
import { WorkerCard } from "@/commonComponents/WorkerCard";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { openChatModalWithUser } from "@/store/slices/chatModalSlice";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  Users,
  UserPlus,
} from "lucide-react";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";

interface WorkersContentProps {
  workers: Worker[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  filters: WorkerFilters;
  selectedWorkerTypes: string[];
  selectedSkills: string[];
}

export function WorkersContent({
  workers,
  pagination,
  isLoading,
  isError,
  error,
  onPageChange,
  onClearFilters,
  onSortChange,
  filters,
  selectedWorkerTypes,
  selectedSkills,
}: WorkersContentProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortBy, setSortBy] = useState(filters.sortBy || "newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    filters.sortOrder || "desc"
  );
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync sort state with filters
  useEffect(() => {
    setSortBy(filters.sortBy || "newest");
    setSortOrder(filters.sortOrder || "desc");
  }, [filters.sortBy, filters.sortOrder]);

  const handleWorkerClick = (worker: Worker) => {
    if (!isAuthenticated) {
      dispatch(openAuthModal());
      return;
    }
    router.push(`/marketplace/workforce/${worker.ID}`);
  };

  const handleChatClick = (worker: Worker) => {
    if (!isAuthenticated || !user) {
      dispatch(openAuthModal());
      return;
    }

    dispatch(
      openChatModalWithUser({
        user_1: user.id,
        user_2: worker.user_id,
      })
    );
  };

  const handleApplyForWorker = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal());
      return;
    }
    router.push("/apply/worker");
  };

  const handleSortChange = (
    newSortBy: string,
    newSortOrder: "asc" | "desc"
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    // Call parent's sort change handler to update filters and trigger API call
    onSortChange(newSortBy, newSortOrder);
    setShowSortOptions(false);
  };

  const sortOptions = [
    { value: "newest", label: "Newest", order: "desc" as const },
    { value: "oldest", label: "Oldest", order: "asc" as const },
    {
      value: "highest_experience",
      label: "Highest Experience",
      order: "desc" as const,
    },
    {
      value: "lowest_experience",
      label: "Lowest Experience",
      order: "asc" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Users className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Workers
          </h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
          {pagination && (
            <p className="text-gray-600 mt-1">
              {pagination.total} worker{pagination.total !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Apply for Worker Button */}
          <button
            onClick={handleApplyForWorker}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm font-medium">Apply for Worker</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Sort</span>
              <ChevronUp
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  showSortOptions ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSortOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleSortChange(option.value, option.order)
                      }
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        sortBy === option.value && sortOrder === option.order
                          ? "bg-green-50 text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      {workers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Workers Found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to see more workers.
          </p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
          {workers.map((worker) => (
            <WorkerCard
              key={worker.ID}
              worker={worker}
              onClick={() => handleWorkerClick(worker)}
              onChatClick={() => handleChatClick(worker)}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.has_prev}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(5, pagination.total_pages) },
              (_, i) => {
                let pageNumber;
                if (pagination.total_pages <= 5) {
                  pageNumber = i + 1;
                } else if (pagination.page <= 3) {
                  pageNumber = i + 1;
                } else if (pagination.page >= pagination.total_pages - 2) {
                  pageNumber = pagination.total_pages - 4 + i;
                } else {
                  pageNumber = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      pageNumber === pagination.page
                        ? "bg-green-600 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
            )}
          </div>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.has_next}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
