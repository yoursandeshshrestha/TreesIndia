"use client";

import { useLocation } from "@/hooks/useLocationRedux";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { openChatModalWithUser } from "@/store/slices/chatModalSlice";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/commonComponents/PropertyCard";
import { PropertyFilters } from "@/types/property";

export default function PropertySection() {
  const router = useRouter();
  const { location, isLoading: locationLoading } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();

  // Create filters for properties for sale
  const saleFilters: PropertyFilters = {
    page: 1,
    limit: 8,
    listing_type: "sale",
    is_approved: true,
    status: "available",
    ...(location?.city && { city: location.city }),
    ...(location?.state && { state: location.state }),
  };

  // Use TanStack Query to fetch properties for sale
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useProperties(saleFilters);

  const properties = response?.data || [];

  const handlePropertyClick = (propertyId: number) => {
    // Validate property ID before navigation
    if (!propertyId || propertyId <= 0) {
      console.error("Invalid property ID:", propertyId);
      return;
    }
    // Navigate to property detail page
    router.push(`/marketplace/properties/${propertyId}`);
  };

  const handleViewAllProperties = () => {
    router.push("/marketplace/rental-properties");
  };

  const handleChatClick = (property: any) => {
    if (!isAuthenticated || !user) {
      dispatch(openAuthModal());
      return;
    }

    dispatch(
      openChatModalWithUser({
        user_1: user.id,
        user_2: property.user_id,
      })
    );
  };

  const getSectionTitle = () => {
    if (location?.city && location?.state) {
      return `Listed Properties in ${location.city}`;
    }
    return "Listed Properties";
  };

  if (isLoading || locationLoading) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {/* Header Section Skeleton */}
        <div className="flex items-center justify-between mb-10">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Properties Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-xl overflow-hidden">
                {/* Property Image Skeleton */}
                <div className="relative w-full h-60 overflow-hidden rounded-xl">
                  <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                </div>

                {/* Property Details Skeleton */}
                <div className="p-3">
                  {/* Property Name Skeleton */}
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>

                  {/* Price Type and Location Skeleton */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-200 rounded mr-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Price Skeleton */}
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError && error) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-semibold text-gray-900 leading-tight">
            {getSectionTitle()}
          </h2>
          <button
            onClick={handleViewAllProperties}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
          >
            View All Properties
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>

        <div className="text-center py-16">
          <div className="max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Failed to load properties
            </h3>
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              We encountered an error while loading the properties. Please try
              again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Don't render the section if there are no properties and not loading/error
  if (properties.length === 0 && !isLoading && !isError) {
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
          onClick={handleViewAllProperties}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
        >
          View All Properties
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property, index) => (
          <PropertyCard
            key={`sale-property-${property.ID}-${index}`}
            property={property}
            onClick={() => handlePropertyClick(property.ID)}
            onChatClick={handleChatClick}
            currentUserId={user?.id}
          />
        ))}
      </div>
    </section>
  );
}
