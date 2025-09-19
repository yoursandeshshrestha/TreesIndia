"use client";

import { useParams } from "next/navigation";
import { useWorkerById, useWorkerStats } from "@/hooks/useWorkers";
import { useProfile } from "@/hooks/useProfile";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";
import { SubscriptionRequired } from "@/commonComponents/SubscriptionRequired";
import {
  MapPin,
  Phone,
  ArrowLeft,
  User,
  Shield,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { openChatModalWithUser } from "@/store/slices/chatModalSlice";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { useAuth } from "@/hooks/useAuth";

export default function WorkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();

  // Safely parse the worker ID with validation
  const workerIdParam = params.id as string;
  const workerId =
    workerIdParam && !isNaN(Number(workerIdParam))
      ? parseInt(workerIdParam)
      : null;

  // First, fetch user profile to check subscription status
  const { userProfile, isLoadingProfile } = useProfile();

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscription?.status === "active";

  // Fetch worker stats (always fetch, even without subscription to show in UI)
  const { data: statsResponse } = useWorkerStats(true);

  // Only fetch worker details if user has active subscription
  const {
    data: response,
    isLoading,
    isError,
  } = useWorkerById(workerId || 0, hasActiveSubscription);

  // Handle invalid worker ID with useEffect to avoid hydration issues
  useEffect(() => {
    if (!workerId || workerId <= 0) {
      router.push("/marketplace/workforce");
    }
  }, [workerId, router]);

  // Show loading while redirecting
  if (!workerId || workerId <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="h-96 bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        title="Subscription Required for Worker Details"
        description="You need an active subscription to view detailed worker information."
        features={[
          "Access to detailed worker profiles",
          "Contact information",
          "Skills and experience details",
          "Availability status",
          "Rating and reviews",
        ]}
        workerStats={statsResponse?.data}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !response?.data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Worker Not Found
              </h3>
              <p className="text-gray-600 mb-4">
                The worker you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <button
                onClick={() => router.push("/marketplace/workforce")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Back to Workers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const worker = response.data;
  console.log("Worker detail page - worker data:", worker);
  console.log("Worker detail page - worker.documents:", worker.documents);

  const getDefaultImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4NS4wNDcgMTUwIDE3MyAxMzcuOTUzIDE3MyAxMjNDMTczIDEwOC4wNDcgMTg1LjA0NyA5NiAyMDAgOTZDMjE0Ljk1MyA5NiAyMjcgMTA4LjA0NyAyMjcgMTIzQzIyNyAxMzcuOTUzIDIxNC45NTMgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMDAgMTgwQzE2NS42NDkgMTgwIDEzNyAxNjUuNjQ5IDEzNyAxNDdDMTM3IDEyOC4zNTEgMTY1LjY0OSAxMTQgMjAwIDExNEMyMzQuMzUxIDExNCAyNjMgMTI4LjM1MSAyNjMgMTQ3QzI2MyAxNjUuNjQ5IDIzNC4zNTEgMTgwIDIwMCAxODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
  };

  const formatLocation = () => {
    if (!worker.address) return "Location not available";
    const { street, city, state, pincode, landmark } = worker.address;
    const parts = [street, city, state, pincode].filter(Boolean);
    if (landmark) parts.push(`Near ${landmark}`);
    return parts.length > 0 ? parts.join(", ") : "Location not available";
  };

  const formatExperience = (years: number) => {
    if (years === 0) return "New Worker";
    return `${years} years`;
  };

  const getWorkerTypeLabel = (type: string) => {
    switch (type) {
      case "normal":
        return "Independent Worker";
      case "treesindia_worker":
        return "TreesIndia Worker";
      default:
        return type;
    }
  };

  const handleChatClick = () => {
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

  // Check if current user is the same as the worker
  const isCurrentUserWorker = user && user.id === worker.user_id;

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
              {/* Worker Header */}
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  {/* Profile Picture */}
                  <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        worker.documents?.profile_pic
                          ? worker.documents.profile_pic
                          : getDefaultImage()
                      }
                      alt={
                        worker.contact_info?.name ||
                        worker.user?.name ||
                        "Worker"
                      }
                      fill
                      className="object-cover"
                      sizes="96px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("data:image/svg+xml")) {
                          target.src = getDefaultImage();
                        }
                      }}
                    />
                  </div>

                  {/* Worker Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                          {worker.contact_info?.name ||
                            worker.user?.name ||
                            "Unknown Worker"}
                        </h1>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{formatLocation()}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              worker.worker_type === "treesindia_worker"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {getWorkerTypeLabel(worker.worker_type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              {worker.skills && (Array.isArray(worker.skills) ? worker.skills.length > 0 : worker.skills) && (
                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Skills & Expertise
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {(Array.isArray(worker.skills) ? worker.skills : [worker.skills]).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience & Stats */}
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Experience & Performance
                </h2>
                <div
                  className={`grid gap-4 ${
                    worker.worker_type === "normal"
                      ? "grid-cols-1 md:grid-cols-1"
                      : "grid-cols-2 md:grid-cols-3"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {formatExperience(worker.experience_years)}
                    </p>
                    <p className="text-sm text-gray-600">Experience</p>
                  </div>
                  {worker.worker_type !== "normal" && (
                    <>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Jobs Done</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {worker.total_jobs}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Earnings</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{worker.earnings.toLocaleString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Additional Info */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {/* Primary Phone */}
                  {(worker.contact_info?.phone || worker.user?.phone) && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Primary Phone</p>
                        <p className="font-medium text-gray-900">
                          {worker.contact_info?.phone || worker.user?.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Alternative Phone */}
                  {worker.contact_info?.alternative_number && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Alternative Phone
                        </p>
                        <p className="font-medium text-gray-900">
                          {worker.contact_info.alternative_number}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {(worker.contact_info?.email || worker.user?.email) && (
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {worker.contact_info?.email || worker.user?.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Verification Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Profile Verified
                    </span>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-700">
                        Verified
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Police Verification
                    </span>
                    <div className="flex items-center">
                      {worker.documents?.police_verification ? (
                        <>
                          <Shield className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-700">
                            Verified
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isCurrentUserWorker && (
                <div className="bg-white rounded-xl p-6">
                  <button
                    onClick={handleChatClick}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
