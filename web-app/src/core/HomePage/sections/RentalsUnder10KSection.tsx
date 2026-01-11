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

export default function RentalsUnder10KSection() {
  const router = useRouter();
  const { location, isLoading: locationLoading } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();

  // Create filters for rental properties under 10000
  const rentalFilters: PropertyFilters = {
    page: 1,
    limit: 8,
    listing_type: "rent",
    max_price: 10000,
    is_approved: true,
    status: "available",
    ...(location?.city && { city: location.city }),
    ...(location?.state && { state: location.state }),
  };

  // Use TanStack Query to fetch rental properties under 10K
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useProperties(rentalFilters);

  const properties = Array.isArray(response?.data) ? response.data : [];

  const handlePropertyClick = (propertyId: number) => {
    // Validate property ID before navigation
    if (!propertyId || propertyId <= 0) {
      console.error("Invalid property ID:", propertyId);
      return;
    }
    // Navigate to property detail page
    router.push(`/marketplace/properties/${propertyId}`);
  };

  const handleViewAllRentals = () => {
    router.push("/marketplace/rental-properties?max_price=10000");
  };

  const handleChatClick = (property: { user_id: number }) => {
    if (!isAuthenticated || !user) {
      dispatch(openAuthModal({}));
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
      return `Rentals Under ₹10,000 in ${location.city}`;
    }
    return "Rentals Under ₹10,000";
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

  // Don't render the section if there are no properties or if there's an error
  if (properties.length === 0 || isError || error) {
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
          onClick={handleViewAllRentals}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
        >
          View All
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property, index) => (
          <PropertyCard
            key={`under10k-rental-property-${property.ID}-${index}`}
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
