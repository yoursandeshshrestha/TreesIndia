"use client";

import React from "react";
import {
  Eye,
  MapPin,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
} from "lucide-react";
import Badge from "@/components/Badge/Badge";
import { Project, ProjectStatus, ProjectType } from "../types";

interface ProjectCardsProps {
  projects: Project[];
  isLoading: boolean;
  onViewProject: (projectId: number) => void;
}

export default function ProjectCards({
  projects,
  isLoading,
  onViewProject,
}: ProjectCardsProps) {
  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      starting_soon: {
        variant: "warning" as const,
        label: "Starting Soon",
      },
      on_going: {
        variant: "primary" as const,
        label: "On Going",
      },
      completed: {
        variant: "success" as const,
        label: "Completed",
      },
      cancelled: {
        variant: "danger" as const,
        label: "Cancelled",
      },
      on_hold: {
        variant: "secondary" as const,
        label: "On Hold",
      },
    };

    const config = statusConfig[status] || statusConfig.starting_soon;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: ProjectType) => {
    const typeConfig = {
      residential: {
        variant: "primary" as const,
        label: "Residential",
      },
      commercial: {
        variant: "secondary" as const,
        label: "Commercial",
      },
      infrastructure: {
        variant: "warning" as const,
        label: "Infrastructure",
      },
    };

    const config = typeConfig[type] || typeConfig.residential;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    }/uploads/${imagePath}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (days?: number) => {
    if (!days || days === 0) return "Not mentioned";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
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
    );
  }

  // Ensure projects is always an array
  const projectsArray = Array.isArray(projects) ? projects : [];

  if (!projectsArray || projectsArray.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Building className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or create a new project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projectsArray.map((project) => (
          <div
            key={project.ID}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer"
            onClick={() => onViewProject(project.ID)}
          >
            {/* Project Image */}
            <div className="relative h-48 bg-gray-100">
              {project.images && project.images.length > 0 ? (
                <img
                  src={getImageUrl(project.images[0])}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={`absolute inset-0 flex items-center justify-center ${
                  project.images && project.images.length > 0 ? "hidden" : ""
                }`}
              >
                <Building className="h-16 w-16 text-gray-400" />
              </div>

              {/* Status and Type Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {getStatusBadge(project.status)}
                {getTypeBadge(project.project_type)}
              </div>
            </div>

            {/* Project Content */}
            <div className="p-4 flex flex-col flex-grow">
              {/* Main Content */}
              <div className="flex-grow space-y-3">
                {/* Project Title and Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div>
                      {project.city}, {project.state}
                    </div>
                    {project.address && (
                      <div className="text-xs text-gray-500">
                        {project.address}
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} className="flex-shrink-0" />
                  <span>
                    Duration: {formatDuration(project.estimated_duration_days)}
                  </span>
                </div>

                {/* Contact Information */}
                {project.contact_info && (
                  <div className="space-y-1">
                    {project.contact_info.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={12} />
                        <span>{project.contact_info.phone}</span>
                      </div>
                    )}
                    {project.contact_info.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={12} />
                        <span className="line-clamp-1">
                          {project.contact_info.email}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* User Information */}
                {project.user && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <User size={14} />
                      <span>Created by</span>
                    </div>
                    <div className="space-y-1">
                      {project.user.name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={12} />
                          <span className="font-medium">
                            {project.user.name}
                          </span>
                        </div>
                      )}
                      {project.user.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={12} />
                          <span>{project.user.email}</span>
                        </div>
                      )}
                      {project.user.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={12} />
                          <span>{project.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Created Date and View Details - Always at bottom */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 mt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar size={12} />
                  <span>Created {formatDate(project.CreatedAt)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProject(project.ID);
                  }}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Eye size={12} />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
