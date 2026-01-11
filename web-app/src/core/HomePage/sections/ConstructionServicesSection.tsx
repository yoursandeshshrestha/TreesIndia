"use client";

import { useLocation } from "@/hooks/useLocationRedux";
import { useServices } from "@/hooks/useServices";
import { useAppDispatch } from "@/store/hooks";
import { openServiceDetailModal } from "@/store/slices/serviceDetailModalSlice";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import ServiceCard from "@/commonComponents/ServiceCard/ServiceCard";
import { ServiceFilters } from "@/types/api";

export default function ConstructionServicesSection() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { location, isLoading: locationLoading } = useLocation();

  // Create filters for construction services
  const serviceFilters: ServiceFilters = {
    page: 1,
    limit: 8,
    category: "Construction Services",
    exclude_inactive: true,
    ...(location?.city && { city: location.city }),
    ...(location?.state && { state: location.state }),
  };

  // Use TanStack Query to fetch construction services
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useServices(serviceFilters);

  const services = Array.isArray(response?.data?.services) ? response.data.services : [];

  const handleServiceClick = (service: { id: number; name: string }) => {
    dispatch(openServiceDetailModal(service));
  };

  const handleViewAllServices = () => {
    router.push("/services?category=Construction+Services");
  };

  const getSectionTitle = () => {
    if (location?.city && location?.state) {
      return `Construction Services in ${location.city}`;
    }
    return "Construction Services";
  };

  if (isLoading || locationLoading) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {/* Header Section Skeleton */}
        <div className="flex items-center justify-between mb-10">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Services Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-xl overflow-hidden">
                {/* Service Image Skeleton */}
                <div className="relative w-full h-60 overflow-hidden rounded-xl">
                  <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                </div>

                {/* Service Details Skeleton */}
                <div className="p-3">
                  {/* Service Name Skeleton */}
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>

                  {/* Price Type and Duration Skeleton */}
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

  // Don't render the section if there are no services or if there's an error
  if (services.length === 0 || isError || error) {
    return null;
  }

  return (
    <section className="px-6 py-20 lg:py-0 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between mb-10">
        <h2 className="text-2xl lg:text-4xl font-semibold text-gray-900 leading-tight">
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
    </section>
  );
}
