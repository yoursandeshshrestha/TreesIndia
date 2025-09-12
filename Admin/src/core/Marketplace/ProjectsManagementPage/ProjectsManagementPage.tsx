"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import Pagination from "@/components/Pagination/Pagination";

// Components
import ProjectHeader from "./components/ProjectHeader";
import ProjectFilters from "./components/ProjectFilters";
import ProjectCards from "./components/ProjectCards";
import ProjectTabs from "./components/ProjectTabs";

// Hooks and types
import { useProjects } from "./hooks/useProjects";
import { ProjectFilters as ProjectFiltersType, ProjectTabType } from "./types";

function ProjectsManagementPage() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filters - simplified to match Services page
  const [filters, setFilters] = useState({
    search: "",
    projectType: "all",
    status: "all",
    sortBy: "created_at",
    sortOrder: "desc",
    activeTab: "all" as ProjectTabType,
  });

  const {
    projects,
    stats,
    isLoading,
    totalPages,
    fetchProjects,
    fetchStats,
    refreshProjects,
  } = useProjects();

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  // Fetch projects when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Convert simplified filters to the format expected by the API
        const apiFilters: ProjectFiltersType = {
          search: filters.search,
          projectType: getProjectTypeFromTab(filters.activeTab),
          status: getStatusFromTab(filters.activeTab, filters.status),
          state: "",
          city: "",
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          activeTab: filters.activeTab,
        };

        await fetchProjects({
          page: currentPage,
          limit: itemsPerPage,
          ...apiFilters,
        });
        setIsSearching(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects");
        setIsSearching(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, filters, fetchProjects]);

  // Helper function to get status filter based on active tab
  const getStatusFromTab = (
    activeTab: ProjectTabType,
    currentStatus: string
  ): string => {
    switch (activeTab) {
      case "residential":
        return ""; // Project type filter will handle this
      case "commercial":
        return ""; // Project type filter will handle this
      case "infrastructure":
        return ""; // Project type filter will handle this
      case "all":
      default:
        return currentStatus === "all" ? "" : currentStatus;
    }
  };

  // Helper function to get project type filter based on active tab
  const getProjectTypeFromTab = (activeTab: ProjectTabType): string => {
    switch (activeTab) {
      case "residential":
        return "residential";
      case "commercial":
        return "commercial";
      case "infrastructure":
        return "infrastructure";
      case "all":
      default:
        return filters.projectType === "all" ? "" : filters.projectType;
    }
  };

  // Fetch stats when component mounts
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = async () => {
    try {
      await refreshProjects();
      toast.success("Projects refreshed successfully");
    } catch (error) {
      console.error("Error refreshing projects:", error);
      toast.error("Failed to refresh projects");
    }
  };

  const handleCreateProject = () => {
    router.push("/dashboard/marketplace/projects/create");
  };

  const handleViewProject = (projectId: number) => {
    router.push(`/dashboard/marketplace/projects/${projectId}`);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      projectType: "all",
      status: "all",
      sortBy: "created_at",
      sortOrder: "desc",
      activeTab: "all",
    });
    setLocalSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <ProjectHeader
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
          onRefresh={handleRefresh}
          onCreateProject={handleCreateProject}
          isLoading={isLoading}
        />

        {/* Filters - Show for all tabs */}
        <ProjectFilters
          search={localSearch}
          projectType={filters.projectType}
          status={filters.status}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSearchChange={(value: string) => {
            setLocalSearch(value);
            setIsSearching(true);
          }}
          onProjectTypeChange={(value: string) => {
            setFilters((prev) => ({ ...prev, projectType: value }));
            setCurrentPage(1);
          }}
          onStatusChange={(value: string) => {
            setFilters((prev) => ({ ...prev, status: value }));
            setCurrentPage(1);
          }}
          onSortByChange={(value: string) => {
            setFilters((prev) => ({ ...prev, sortBy: value }));
            setCurrentPage(1);
          }}
          onSortOrderChange={(value: string) => {
            setFilters((prev) => ({ ...prev, sortOrder: value }));
            setCurrentPage(1);
          }}
          onClear={clearFilters}
          onClearSearch={() => {
            setLocalSearch("");
            setIsSearching(false);
          }}
          isSearching={isSearching}
        />

        {/* Project Tabs - Always show */}
        <ProjectTabs
          activeTab={filters.activeTab}
          onTabChange={(tab: ProjectTabType) => {
            setFilters((prev) => ({ ...prev, activeTab: tab }));
            setCurrentPage(1);
          }}
          stats={stats}
        />

        {/* Projects Cards */}
        <div className="mt-4">
          <ProjectCards
            projects={projects}
            isLoading={isLoading}
            onViewProject={handleViewProject}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectsManagementPage;
