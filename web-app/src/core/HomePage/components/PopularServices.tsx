"use client";

import { PopularService } from "@/types/api";
import { useLocation } from "@/hooks/useLocationRedux";
import { usePopularServices } from "@/hooks/usePopularServices";
import { useAppDispatch } from "@/store/hooks";
import { openLocationModal } from "@/store/slices/locationModalSlice";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import ServiceCard from "./ServiceCard";
import { PopularServicesSkeleton } from "./PopularServicesSkeleton";

export default function PopularServices() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { location, isLoading: locationLoading } = useLocation();

  // Use TanStack Query to fetch popular services
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = usePopularServices({
    city: location?.city,
    state: location?.state,
    enabled: !locationLoading, // Allow fetching even without location - backend will show all services
  });

  const services = response?.data || [];

  const handleServiceClick = (service: PopularService) => {
    // Navigate to the booking page for the selected service
    router.push(`/services/${service.id}/book`);
  };

  const handleViewAllServices = () => {
    router.push("/services");
  };

  const getSectionTitle = () => {
    if (location?.city && location?.state) {
      return `Popular Services in ${location.city}`;
    }
    return "Popular Services";
  };

  if (isLoading || locationLoading) {
    return <PopularServicesSkeleton />;
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
            onClick={handleViewAllServices}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
          >
            View All Services
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>

        <div className="text-center py-16">
          <div className="max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Failed to load popular services
            </h3>
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              We encountered an error while loading the popular services. Please
              try again later.
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

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-semibold text-gray-900 leading-tight">
          {getSectionTitle()}
        </h2>
        <button
          onClick={handleViewAllServices}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
        >
          View All Services
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onClick={() => handleServiceClick(service)}
          />
        ))}
      </div>

      {services.length === 0 && !isLoading && !isError && (
        <div className="text-center py-16">
          <div className="max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {location?.city && location?.state
                ? `No services available in ${location.city}`
                : "No popular services available"}
            </h3>
            <p className="text-gray-600 text-base leading-relaxed">
              {location?.city && location?.state
                ? `We don't have any services available in ${location.city}, ${location.state} at the moment. Please try selecting a different location or check back later.`
                : "No popular services are currently available. Please check back later."}
            </p>
            {location?.city && location?.state && (
              <div className="mt-6">
                <button
                  onClick={() => dispatch(openLocationModal())}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Try Different Location
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
