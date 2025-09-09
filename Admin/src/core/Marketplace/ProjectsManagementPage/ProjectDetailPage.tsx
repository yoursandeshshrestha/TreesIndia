"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  XCircle,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Badge from "@/components/Badge/Badge";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import {
  Project,
  ProjectStatus,
  ProjectType,
  UpdateProjectRequest,
} from "./types";
import { useProjects } from "./hooks/useProjects";
import { Loader } from "@/components/Loader";
import { ProjectModal } from "./components/ProjectModal";

interface ProjectDetailPageProps {
  projectId: number;
}

export default function ProjectDetailPage({
  projectId,
}: ProjectDetailPageProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getProject, deleteProject, updateProject } = useProjects();

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projectData = await getProject(projectId);
      setProject(projectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
      toast.error("Error loading project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!project) return;

    try {
      setIsToggling(true);

      // Determine new status based on current status
      let newStatus: ProjectStatus;
      if (project.status === "on_going") {
        newStatus = "on_hold";
      } else if (project.status === "on_hold") {
        newStatus = "on_going";
      } else if (project.status === "starting_soon") {
        newStatus = "on_going";
      } else {
        newStatus = "on_going"; // Default to on_going for other statuses
      }

      await updateProject(projectId, { status: newStatus });

      setProject((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
            }
          : null
      );

      toast.success(`Project status updated to ${newStatus.replace("_", " ")}`);
    } catch (err) {
      console.error("Failed to update project status", err);
      toast.error("Failed to update project status");
    } finally {
      setIsToggling(false);
    }
  };

  const handleUpdateProject = async (
    data: UpdateProjectRequest,
    imageFiles?: File[]
  ) => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      let response;

      if (imageFiles && imageFiles.length > 0) {
        // Use FormData for file uploads
        const formData = new FormData();

        // Append all project data
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === "boolean") {
              formData.append(key, value.toString());
            } else if (typeof value === "object" && Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        // Append image files
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });

        response = await updateProject(projectId, formData);
      } else {
        // Use JSON for data without files
        response = await updateProject(projectId, data);
      }

      if (response) {
        toast.success("Project updated successfully");
        setIsEditModalOpen(false);
        loadProject(); // Reload the project data
      }
    } catch (err) {
      console.error("Failed to update project", err);
      toast.error("Failed to update project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    try {
      await deleteProject(projectId);
      toast.success("Project deleted successfully");
      router.push("/dashboard/marketplace/projects/all");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      starting_soon: { variant: "warning" as const, label: "Starting Soon" },
      on_going: { variant: "primary" as const, label: "On Going" },
      completed: { variant: "success" as const, label: "Completed" },
      cancelled: { variant: "danger" as const, label: "Cancelled" },
      on_hold: { variant: "secondary" as const, label: "On Hold" },
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
      residential: { variant: "primary" as const, label: "Residential" },
      commercial: { variant: "secondary" as const, label: "Commercial" },
      infrastructure: { variant: "warning" as const, label: "Infrastructure" },
    };

    const config = typeConfig[type] || typeConfig.residential;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (days?: number) => {
    if (!days || days === 0) return "Not mentioned";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <XCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Project Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "The project you're looking for doesn't exist."}
        </p>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/marketplace/projects")}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push("/dashboard/marketplace/projects")}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project.title}
              </h1>
              <p className="text-sm text-gray-600">
                Created on {formatDate(project.CreatedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit size={16} />}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              leftIcon={<Trash2 size={16} />}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Project Type</p>
                      <p className="font-medium capitalize">
                        {project.project_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">
                        {formatDuration(project.estimated_duration_days)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">
                        {project.city}, {project.state}
                      </p>
                    </div>
                  </div>
                  {project.pincode && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Pincode</p>
                        <p className="font-medium">{project.pincode}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">
                        {formatDate(project.CreatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Images */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Project Images
                </h2>
                {project.images && project.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={
                            image.startsWith("http")
                              ? image
                              : `${
                                  process.env.NEXT_PUBLIC_API_URL ||
                                  "http://localhost:8080"
                                }/uploads/${image}`
                          }
                          alt={`${project.title} - Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                              <div class="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                                </svg>
                              </div>
                            `;
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building
                      size={48}
                      className="mx-auto text-gray-300 mb-4"
                    />
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {project.description && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Location
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Address</div>
                      <div className="text-gray-900">
                        {project.address || `${project.city}, ${project.state}`}
                      </div>
                    </div>
                  </div>
                  {project.pincode && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">Pincode</div>
                        <div className="text-gray-900">{project.pincode}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Management */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status Management
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Current Status
                    </span>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Project Type</span>
                    {getTypeBadge(project.project_type)}
                  </div>
                  {project.uploaded_by_admin && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uploaded By</span>
                      <Badge variant="primary">
                        <Shield size={14} className="mr-1" />
                        Admin
                      </Badge>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={isToggling}
                    className="w-full"
                    leftIcon={
                      project.status === "on_going" ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )
                    }
                  >
                    {isToggling
                      ? "Updating..."
                      : project.status === "on_going"
                      ? "Mark as On Hold"
                      : project.status === "on_hold"
                      ? "Mark as On Going"
                      : "Mark as On Going"}
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full"
                    leftIcon={<Edit size={16} />}
                  >
                    Edit Project
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push("/dashboard/marketplace/projects")
                    }
                    className="w-full"
                    leftIcon={<ArrowLeft size={16} />}
                  >
                    Back to Projects
                  </Button>
                </div>
              </div>

              {/* Contact Information */}
              {project.contact_info && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {project.contact_info.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Phone</div>
                          <div className="text-gray-900">
                            {project.contact_info.phone}
                          </div>
                        </div>
                      </div>
                    )}
                    {project.contact_info.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <div className="text-gray-900">
                            {project.contact_info.email}
                          </div>
                        </div>
                      </div>
                    )}
                    {project.contact_info.contact_person && (
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Contact Person
                          </div>
                          <div className="text-gray-900">
                            {project.contact_info.contact_person}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Information */}
              {project.user && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Project Owner
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">Name</div>
                        <div className="text-gray-900 font-medium">
                          {project.user.name}
                        </div>
                      </div>
                    </div>
                    {project.user.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <div className="text-gray-900">
                            {project.user.email}
                          </div>
                        </div>
                      </div>
                    )}
                    {project.user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">Phone</div>
                          <div className="text-gray-900">
                            {project.user.phone}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Timestamps
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Created</div>
                      <div className="text-gray-900">
                        {formatDate(project.CreatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Last Updated</div>
                      <div className="text-gray-900">
                        {formatDate(project.UpdatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        onSubmit={handleUpdateProject}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
