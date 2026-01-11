"use client";

import { useLocation } from "@/hooks/useLocationRedux";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/commonComponents/ProjectCard/ProjectCard";
import { ProjectFilters } from "@/types/project";

export default function ProjectsSection() {
  const router = useRouter();
  const { location, isLoading: locationLoading } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();

  // Create filters for projects
  const projectFilters: ProjectFilters = {
    page: 1,
    limit: 8,
    ...(location?.city && { city: location.city }),
    ...(location?.state && { state: location.state }),
  };

  // Use TanStack Query to fetch projects
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useProjects(projectFilters);

  const projects = Array.isArray(response?.data) ? response.data : [];

  const handleProjectClick = (projectId: number) => {
    // Validate project ID before navigation
    if (!projectId || projectId <= 0) {
      console.error("Invalid project ID:", projectId);
      return;
    }
    // Navigate to project detail page
    router.push(`/marketplace/projects/${projectId}`);
  };

  const handleViewAllProjects = () => {
    router.push("/marketplace/projects");
  };

  const handleChatClick = (project: { user_id: number }) => {
    if (!isAuthenticated || !user) {
      dispatch(openAuthModal({}));
      return;
    }

    // Import chat modal action if available
    // dispatch(openChatModalWithUser({ user_1: user.id, user_2: project.user_id }));
  };

  const getSectionTitle = () => {
    if (location?.city && location?.state) {
      return `Projects in ${location.city}`;
    }
    return "Projects";
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

  // Don't render the section if there are no projects or if there's an error
  if (projects.length === 0 || isError || error) {
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
          onClick={handleViewAllProjects}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
        >
          View All Projects
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project, index) => (
          <ProjectCard
            key={`project-${project.ID}-${index}`}
            project={project}
            onClick={() => handleProjectClick(project.ID)}
            onChatClick={handleChatClick}
            currentUserId={user?.id}
          />
        ))}
      </div>
    </section>
  );
}
