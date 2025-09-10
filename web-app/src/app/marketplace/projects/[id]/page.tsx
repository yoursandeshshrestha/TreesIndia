"use client";

import { useParams } from "next/navigation";
import { useProjectById, useProjectStats } from "@/hooks/useProjects";
import { useProfile } from "@/hooks/useProfile";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";
import { SubscriptionRequired } from "@/commonComponents/SubscriptionRequired";
import {
  MapPin,
  Calendar,
  Building,
  Clock,
  Shield,
  ArrowLeft,
  User,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  // First, fetch user profile to check subscription status
  const { userProfile, isLoadingProfile } = useProfile();

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscription?.status === "active";

  // Fetch project stats (always fetch, even without subscription to show in UI)
  const { data: statsResponse } = useProjectStats(true);

  // Only fetch project details if user has active subscription
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useProjectById(projectId, hasActiveSubscription);

  const project = response?.data;

  // Show loading state while checking profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show subscription required UI if user doesn't have active subscription
  if (!hasActiveSubscription) {
    return (
      <SubscriptionRequired
        title="Subscription Required for Project Details"
        description="You need an active subscription to view detailed project information."
        features={[
          "Access to detailed project information",
          "Contact details of project owners",
          "Project timeline and progress updates",
          "High-resolution project images",
          "Priority customer support",
        ]}
        projectStats={statsResponse?.data}
      />
    );
  }


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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner variant="fullscreen" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Project Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error?.message || "The project you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push("/marketplace/projects")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 px-4 sm:px-6 lg:px-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Main Content Layout */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Header */}
              <div className="bg-white">
                {/* Title and Location */}
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {project.title}
                </h1>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>
                    {project.address || `${project.city}, ${project.state}`}
                  </span>
                </div>
              </div>

              {/* Project Images */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="relative h-96 bg-gray-200">
                  {project.images && project.images.length > 0 ? (
                    <Image
                      src={project.images[0]}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Building className="w-16 h-16 mx-auto mb-4" />
                        <p>No image available</p>
                      </div>
                    </div>
                  )}

                  {/* Image Counter */}
                  {project.images && project.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      1/{project.images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {project.images && project.images.length > 1 && (
                  <div className="p-4">
                    <div className="flex space-x-2">
                      {project.images.slice(0, 3).map((image, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden relative"
                        >
                          <Image
                            src={image}
                            alt={`${project.title} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Project Details
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Building className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-sm font-semibold">
                        {getProjectTypeLabel(project.project_type)}
                      </p>
                    </div>
                  </div>
                  {project.estimated_duration_days && (
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-600 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-semibold">
                          {formatDuration(project.estimated_duration_days)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-semibold">
                        {getStatusLabel(project.status)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Posted</p>
                      <p className="text-sm font-semibold">
                        {new Date(
                          project.CreatedAt || project.created_at || ""
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                )}

                {/* Location Details */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Location
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {project.address && (
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {project.address}
                      </p>
                    )}
                    {project.city && (
                      <p>
                        <span className="font-medium">City:</span>{" "}
                        {project.city}
                      </p>
                    )}
                    {project.state && (
                      <p>
                        <span className="font-medium">State:</span>{" "}
                        {project.state}
                      </p>
                    )}
                    {project.pincode && (
                      <p>
                        <span className="font-medium">Pincode:</span>{" "}
                        {project.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Project Information */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Project Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Project Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getProjectTypeLabel(project.project_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getStatusLabel(project.status)}
                    </p>
                  </div>
                  {project.estimated_duration_days && (
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDuration(project.estimated_duration_days)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Posted On</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(
                        project.CreatedAt || project.created_at || ""
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              {project.user && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Contact
                  </h3>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 font-medium">
                      Owner: {project.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {project.user.user_type}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {project.user.phone && (
                      <button className="w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center">
                        <Phone className="w-3 h-3 mr-2" />
                        Call Owner {project.user.phone}
                      </button>
                    )}

                    <button className="w-full border border-green-600 text-green-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                      Send Message
                    </button>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Additional Information
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Project ID:</span> #
                    {project.ID || project.id}
                  </p>
                  <p>
                    <span className="font-medium">Listed on:</span>{" "}
                    {new Date(
                      project.CreatedAt || project.created_at || ""
                    ).toLocaleDateString()}
                  </p>
                  {project.status && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Status:</span>
                      <span className="inline-flex items-center text-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
