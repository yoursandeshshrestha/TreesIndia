"use client";

import {
  Image as ImageIcon,
  Package,
  MessageSquare,
  MapPin,
  Clock,
  Calendar,
  ExternalLink,
  IndianRupee,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Service } from "../types";
import Badge from "@/components/Badge/Badge";
import { HTMLRenderer } from "@/components/HTMLRenderer";

interface ServiceGridProps {
  services: Service[];
}

export default function ServiceGrid({ services }: ServiceGridProps) {
  const router = useRouter();
  const formatPrice = (price: number | undefined, priceType: string) => {
    if (priceType === "inquiry") {
      return "Inquiry Based";
    }
    if (price === undefined || price === null) {
      return "N/A";
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const getPriceTypeBadge = (priceType: string) => {
    if (priceType === "fixed") {
      return (
        <Badge variant="warning" className="text-xs">
          <IndianRupee size={12} className="mr-1" />
          Fixed Price
        </Badge>
      );
    }
    return (
      <Badge variant="primary" className="text-xs">
        <MessageSquare size={12} className="mr-1" />
        Inquiry Based
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "success" : "secondary"} className="text-xs">
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service) => (
        <div
          key={service.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer flex flex-col"
          onClick={() => router.push(`/dashboard/services/${service.id}`)}
        >
          {/* Service Image */}
          <div className="relative h-48 bg-gray-100">
            {service.images && service.images.length > 0 ? (
              <img
                src={service.images[0]}
                alt={service.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <ImageIcon size={48} className="text-gray-400" />
              </div>
            )}

            {/* Status and Price Type Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {getStatusBadge(service.is_active)}
              {getPriceTypeBadge(service.price_type)}
            </div>
          </div>

          {/* Service Content */}
          <div className="p-4 flex flex-col flex-grow">
            {/* Main Content */}
            <div className="flex-grow space-y-3">
              {/* Service Name and Description */}
              <div>
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                  {service.name}
                </h3>
                {service.description && (
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    <HTMLRenderer
                      html={service.description}
                      className="line-clamp-2"
                      stripDataAttributes={true}
                    />
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package size={14} />
                <span className="font-medium">
                  {service.category?.name || service.category_name || "N/A"}
                </span>
                {(service.subcategory?.name || service.subcategory_name) && (
                  <>
                    <span>•</span>
                    <span>
                      {service.subcategory?.name || service.subcategory_name}
                    </span>
                  </>
                )}
              </div>

              {/* Service Areas */}
              {service.service_areas && service.service_areas.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                  <div className="line-clamp-2">
                    {service.service_areas.slice(0, 2).map((area, index) => (
                      <span key={area.id}>
                        {area.city}, {area.state}
                        {index <
                          Math.min(service.service_areas!.length - 1, 1) &&
                          ", "}
                      </span>
                    ))}
                    {service.service_areas.length > 2 && (
                      <span className="text-gray-500">
                        +{service.service_areas.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing - Only show for fixed price services */}
              {service.price_type === "fixed" && (
                <div className="space-y-2">
                  {service.duration && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>Duration: {service.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {formatPrice(service.price, service.price_type)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Created Date and View Details - Always at bottom */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 mt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar size={12} />
                <span>Created {formatDate(service.created_at)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/services/${service.id}`);
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ExternalLink size={12} />
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
