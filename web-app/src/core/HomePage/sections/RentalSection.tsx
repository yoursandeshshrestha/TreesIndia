"use client";

import { useLocation } from "@/hooks/useLocationRedux";
import { useProperties } from "@/hooks/useProperties";
import { useAppDispatch } from "@/store/hooks";
import { openLocationModal } from "@/store/slices/locationModalSlice";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/commonComponents/PropertyCard";
import { PropertyFilters } from "@/types/property";

export default function RentalSection() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { location, isLoading: locationLoading } = useLocation();

  // Create filters for rental properties
  const rentalFilters: PropertyFilters = {
    page: 1,
    limit: 8,
    listing_type: "rent",
    is_approved: true,
    status: "available",
    ...(location?.city && { city: location.city }),
    ...(location?.state && { state: location.state }),
  };

  // Use TanStack Query to fetch rental properties
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useProperties(rentalFilters);

  const properties = response?.data || [];

  const handlePropertyClick = (propertyId: number) => {
    // Navigate to property detail page
    router.push(`/marketplace/properties/${propertyId}`);
  };

  const handleViewAllRentals = () => {
    router.push("/marketplace/rental-properties");
  };

  const getSectionTitle = () => {
    if (location?.city && location?.state) {
      return `Listed Rentals in ${location.city}`;
    }
    return "Listed Rentals";
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

  if (isError || error) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl font-semibold text-gray-900 leading-tight mb-4">
            {getSectionTitle()}
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 mb-4">
              Failed to load rental properties. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-semibold text-gray-900 leading-tight">
          {getSectionTitle()}
        </h2>
        <button
          onClick={handleViewAllRentals}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
        >
          View All Rentals
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={() => handlePropertyClick(property.id)}
          />
        ))}
      </div>

      {properties.length === 0 && !isLoading && !isError && (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <p className="text-gray-500 mb-4">
              No rental properties available at the moment.
            </p>
            {!location?.city && (
              <button
                onClick={() => dispatch(openLocationModal())}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
              >
                Set Location to See Rentals
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
