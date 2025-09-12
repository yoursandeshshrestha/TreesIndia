"use client";

import { Project } from "@/types/project";
import { MapPin, Building, Clock } from "lucide-react";
import Image from "next/image";

interface ProjectCardProps {
  project: Project;
  onClick?: (projectId: number) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(project.ID || project.id || 0);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "starting_soon":
        return "bg-blue-100 text-blue-800";
      case "on_going":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "starting_soon":
        return "Starting Soon";
      case "on_going":
        return "On Going";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "on_hold":
        return "On Hold";
      default:
        return status;
    }
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case "residential":
        return "Residential";
      case "commercial":
        return "Commercial";
      case "infrastructure":
        return "Infrastructure";
      default:
        return type;
    }
  };

  const formatDuration = (days: number | null) => {
    if (!days) return "TBD";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  const getDefaultImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4NS4wNDcgMTUwIDE3MyAxMzcuOTUzIDE3MyAxMjNDMTczIDEwOC4wNDcgMTg1LjA0NyA5NiAyMDAgOTZDMjE0Ljk1MyA5NiAyMjcgMTA4LjA0NyAyMjcgMTIzQzIyNyAxMzcuOTUzIDIxNC45NTMgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMDAgMTgwQzE2NS42NDkgMTgwIDEzNyAxNjUuNjQ5IDEzNyAxNDdDMTM3IDEyOC4zNTEgMTY1LjY0OSAxMTQgMjAwIDExNEMyMzQuMzUxIDExNCAyNjMgMTI4LjM1MSAyNjMgMTQ3QzI2MyAxNjUuNjQ5IDIzNC4zNTEgMTgwIDIwMCAxODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
        {/* Project Image */}
        <div className="relative w-full h-60 overflow-hidden">
          <Image
            src={
              project.images && project.images.length > 0
                ? project.images[0]
                : getDefaultImage()
            }
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes("data:image/svg+xml")) {
                target.src = getDefaultImage();
              }
            }}
          />

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                project.status
              )}`}
            >
              {getStatusLabel(project.status)}
            </span>
          </div>
        </div>

        {/* Project Details */}
        <div className="p-4">
          {/* Project Title */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">
            {project.title}
          </h3>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {project.description.length > 100
                ? `${project.description.substring(0, 100)}...`
                : project.description}
            </p>
          )}

          {/* Location */}
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {project.city && project.state
                ? `${project.city}, ${project.state}`
                : project.city || project.state || "Location not specified"}
            </span>
          </div>

          {/* Project Type and Duration */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center text-gray-600 text-sm">
              <Building className="w-4 h-4 mr-1" />
              <span>{getProjectTypeLabel(project.project_type)}</span>
            </div>
            {project.estimated_duration_days && (
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatDuration(project.estimated_duration_days)}</span>
              </div>
            )}
          </div>

          {/* Posted Date */}
          <div className="text-xs text-gray-500">
            Posted{" "}
            {new Date(
              project.CreatedAt || project.created_at || ""
            ).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
