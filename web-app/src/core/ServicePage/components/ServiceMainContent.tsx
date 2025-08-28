import { Category, Subcategory, Service } from "@/types/api";
import { useLocation } from "@/hooks/useLocationRedux";
import { ServiceCard } from "./ServiceCard";
import { ServiceMainContentSkeleton } from "./ServiceSkeleton";

interface ServiceMainContentProps {
  selectedCategory?: Category;
  selectedSubcategory?: Subcategory;
  services: Service[];
  servicesLoading: boolean;
  servicesError: Error | null;
}

export function ServiceMainContent({
  selectedCategory,
  selectedSubcategory,
  services,
  servicesLoading,
  servicesError,
}: ServiceMainContentProps) {
  const { location, isLoading: locationLoading } = useLocation();

  const getLocationText = () => {
    if (locationLoading) {
      return "Available services";
    }
    if (location?.city) {
      return `Available services in ${location.city}`;
    }
    return "Available services";
  };

  return (
    <div className="flex-1 px-6 pt-0 pb-6 ">
      <h2 className="text-2xl font-semibold bg-white text-gray-900 mb-6">
        {selectedSubcategory ? getLocationText() : "All Services"}
      </h2>
      <div className="max-w-4xl border border-gray-200 rounded-lg p-5">
        {servicesLoading ? (
          <ServiceMainContentSkeleton />
        ) : servicesError ? (
          <div className="text-center py-8">
            <p className="text-red-600">
              {location?.city
                ? `Failed to load services for ${location.city}`
                : "Failed to load services"}
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {location?.city
                ? `No services available${
                    selectedSubcategory ? ` for this category` : ""
                  } in ${location.city}`
                : `No services available${
                    selectedSubcategory ? ` for this category` : ""
                  }`}
            </p>
          </div>
        ) : (
          <div className="space-y-6 bg-white">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                showDivider={index < services.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
