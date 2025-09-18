"use client";

import { useParams } from "next/navigation";
import { useVendorById, useVendorStats } from "@/hooks/useVendors";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { openChatModalWithUser } from "@/store/slices/chatModalSlice";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";
import { SubscriptionRequired } from "@/commonComponents/SubscriptionRequired";
import {
  MapPin,
  Building2,
  Phone,
  Clock,
  User,
  ArrowLeft,
  Shield,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  formatAddressWithLandmark,
  formatAddressShort,
} from "@/utils/addressUtils";
import { formatDescriptionForDetails } from "@/utils/textUtils";

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();
  const [isClient, setIsClient] = useState(false);

  // Safely parse the vendor ID with validation
  const vendorIdParam = params.id as string;
  const vendorId =
    vendorIdParam && !isNaN(Number(vendorIdParam))
      ? parseInt(vendorIdParam)
      : null;

  // First, fetch user profile to check subscription status
  const { userProfile, isLoadingProfile } = useProfile();

  // Fix hydration issues by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscription?.status === "active";

  // Fetch vendor stats (always fetch, even without subscription to show in UI)
  const { data: statsResponse } = useVendorStats(true);

  // Only fetch vendor details if user has active subscription
  const {
    data: response,
    isLoading,
    isError,
  } = useVendorById(vendorId || 0, hasActiveSubscription);

  // Handle invalid vendor ID with useEffect to avoid hydration issues
  useEffect(() => {
    if (!vendorId || vendorId <= 0) {
      router.push("/marketplace/vendors");
    }
  }, [vendorId, router]);

  // Show loading while redirecting
  if (!vendorId || vendorId <= 0) {
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

  // Show loading state while checking profile or during hydration
  if (!isClient || isLoadingProfile) {
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
        title="Subscription Required for Vendor Details"
        description="You need an active subscription to view detailed vendor information."
        features={[
          "Access to detailed vendor information",
          "Contact details of vendors",
          "Business gallery and portfolio",
          "Service offerings and pricing",
          "Priority customer support",
        ]}
        vendorStats={statsResponse?.data}
      />
    );
  }

  const vendor = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner variant="fullscreen" />
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">
                  Vendor Not Found
                </h3>
                <p className="text-red-600 mb-6">
                  The vendor you&apos;re looking for doesn&apos;t exist or has
                  been removed.
                </p>
                <button
                  onClick={() => router.push("/marketplace/vendors")}
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Vendors
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getBusinessTypeLabel = (type: string) => {
    switch (type) {
      case "individual":
        return "Individual";
      case "partnership":
        return "Partnership";
      case "company":
        return "Company";
      case "llp":
        return "LLP";
      case "pvt_ltd":
        return "Private Limited";
      case "public_ltd":
        return "Public Limited";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const formatYearsInBusiness = (years: number) => {
    if (years === 0) return "New Business";
    if (years === 1) return "1 year";
    return `${years} years`;
  };

  const handleChatClick = () => {
    if (!isAuthenticated || !user) {
      dispatch(openAuthModal());
      return;
    }

    dispatch(
      openChatModalWithUser({
        user_1: user.id,
        user_2: vendor.user_id,
      })
    );
  };

  // Check if current user is the same as the vendor owner
  const isCurrentUserOwner = user && user.id === vendor.user_id;

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
              {/* Vendor Header */}
              <div className="bg-white">
                {/* Title and Location */}
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {vendor.vendor_name}
                </h1>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{formatAddressShort(vendor.business_address)}</span>
                </div>
              </div>

              {/* Vendor Images */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="relative h-96 bg-gray-200">
                  {vendor.business_gallery &&
                  vendor.business_gallery.length > 0 ? (
                    <Image
                      src={vendor.business_gallery[0]}
                      alt={vendor.vendor_name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : vendor.profile_picture ? (
                    <Image
                      src={vendor.profile_picture}
                      alt={vendor.vendor_name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Building2 className="w-16 h-16 mx-auto mb-4" />
                        <p>No image available</p>
                      </div>
                    </div>
                  )}

                  {/* Image Counter */}
                  {vendor.business_gallery &&
                    vendor.business_gallery.length > 1 && (
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        1/{vendor.business_gallery.length}
                      </div>
                    )}
                </div>

                {/* Thumbnail Gallery */}
                {vendor.business_gallery &&
                  vendor.business_gallery.length > 1 && (
                    <div className="p-4">
                      <div className="flex space-x-2">
                        {vendor.business_gallery
                          .slice(0, 3)
                          .map((image, index) => (
                            <div
                              key={index}
                              className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden relative"
                            >
                              <Image
                                src={image}
                                alt={`${vendor.vendor_name} - Image ${
                                  index + 1
                                }`}
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

              {/* Vendor Details */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Vendor Details
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Building2 className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-sm font-semibold">
                        {getBusinessTypeLabel(vendor.business_type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="text-sm font-semibold">
                        {formatYearsInBusiness(vendor.years_in_business)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-semibold">
                        {vendor.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Posted</p>
                      <p className="text-sm font-semibold">
                        {new Date(vendor.CreatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {vendor.business_description && (
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {formatDescriptionForDetails(vendor.business_description)}
                    </p>
                  </div>
                )}

                {/* What We Sell */}
                {vendor.services_offered &&
                  vendor.services_offered.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        What We Sell
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.services_offered.map((item, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg bg-green-100 text-green-800 border border-green-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Location Details */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Location
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {formatAddressWithLandmark(vendor.business_address)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Vendor Information */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Vendor Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Business Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getBusinessTypeLabel(vendor.business_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatYearsInBusiness(vendor.years_in_business)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {vendor.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Posted On</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(vendor.CreatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Contact
                </h3>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 font-medium">
                    Contact: {vendor.contact_person_name}
                  </p>
                  <p className="text-xs text-gray-500">Business Owner</p>
                </div>

                <div className="space-y-2">
                  <button className="w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center">
                    <Phone className="w-3 h-3 mr-2" />
                    Call {vendor.contact_person_phone}
                  </button>

                  {!isCurrentUserOwner && (
                    <button
                      className="w-full border border-green-600 text-green-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors flex items-center justify-center"
                      onClick={handleChatClick}
                    >
                      <MessageCircle className="w-3 h-3 mr-2" />
                      Send Message
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Additional Information
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Vendor ID:</span> #
                    {vendor.ID || vendor.id}
                  </p>
                  <p>
                    <span className="font-medium">Listed on:</span>{" "}
                    {new Date(vendor.CreatedAt).toLocaleDateString()}
                  </p>
                  {vendor.is_active && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Status:</span>
                      <span className="inline-flex items-center text-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Active
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
