"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Project, ProjectFilters } from "@/types/project";
import { ProjectCard } from "@/commonComponents/ProjectCard";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { openChatModalWithUser } from "@/store/slices/chatModalSlice";
import { ChevronDown, Plus } from "lucide-react";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";

interface ProjectsContentProps {
  projects: Project[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  filters: ProjectFilters;
  selectedProjectTypes: string[];
  selectedStatuses: string[];
}

export function ProjectsContent({
  projects,
  pagination,
  isLoading,
  isError,
  error,
  onPageChange,
  onClearFilters,
  filters,
  selectedProjectTypes,
  selectedStatuses,
}: ProjectsContentProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Relevance");
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProjectClick = (projectId: number) => {
    // Validate project ID before navigation
    if (!projectId || projectId <= 0) {
      console.error("Invalid project ID:", projectId);
      return;
    }
    router.push(`/marketplace/projects/${projectId}`);
  };

  const handleCreateProject = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal({ redirectTo: "/marketplace/projects/create" }));
    } else {
      router.push("/marketplace/projects/create");
    }
  };

  const handleChatClick = (project: Project) => {
    if (!isAuthenticated || !user) {
      dispatch(openAuthModal());
      return;
    }

    dispatch(
      openChatModalWithUser({
        user_1: user.id,
        user_2: project.user_id,
      })
    );
  };

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
  ];

  // Generate dynamic header text based on filters
  const generateHeaderText = () => {
    const total = projects.length;
    let text = `${total} Project${total !== 1 ? "s" : ""} Found`;

    if (selectedProjectTypes.length > 0) {
      text += ` in ${selectedProjectTypes.join(", ")}`;
    }

    if (selectedStatuses.length > 0) {
      text += ` (${selectedStatuses.join(", ")})`;
    }

    if (filters.location) {
      text += ` in ${filters.location}`;
    }

    return text;
  };

  const handleSortChange = (sortValue: string, sortLabel: string) => {
    setSelectedSort(sortLabel);
    setIsSortOpen(false);
    // TODO: Implement sorting logic
  };

  const renderPagination = () => {
    if (!pagination || pagination.total_pages <= 1) return null;

    const { page, total_pages } = pagination;
    const pages = [];

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(total_pages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b ${
            i === page
              ? "text-green-600 bg-green-50 border-green-500"
              : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= total_pages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );

    return (
      <div className="flex justify-center mt-8">
        <div className="flex">{pages}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    // Check if error is subscription related
    const isSubscriptionError =
      error?.message?.includes("subscription required") ||
      error?.message?.includes("active subscription required");

    if (isSubscriptionError) {
      return null; // Let the parent component handle subscription error
    }

    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-medium">Error loading projects</p>
          <p className="text-sm">{error?.message}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {generateHeaderText()}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Create Project Button */}
            <button
              onClick={handleCreateProject}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* No Results Message */}
        <div className="text-center py-12">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find any projects matching your criteria. Try
              adjusting your search filters or check back later.
            </p>
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {generateHeaderText()}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <span className="text-sm font-medium text-gray-700">
                  Sort by: {selectedSort}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <div key={option.value} className="relative">
                        <button
                          onClick={() =>
                            handleSortChange(option.value, option.label)
                          }
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between text-gray-700 transition-colors duration-150 ${
                            selectedSort === option.label
                              ? "bg-green-50 text-green-700 font-medium"
                              : ""
                          }`}
                        >
                          <span>{option.label}</span>
                          {selectedSort === option.label && (
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Create Project Button */}
            <button
              onClick={handleCreateProject}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.ID || project.id}
            project={project}
            onClick={handleProjectClick}
            onChatClick={handleChatClick}
            currentUserId={user?.id}
          />
        ))}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
