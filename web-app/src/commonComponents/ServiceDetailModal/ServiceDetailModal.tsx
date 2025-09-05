"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { Service, PopularService } from "@/types/api";

type ServiceDetailModalService = Service | PopularService;

interface ServiceDetailModalProps {
  service: ServiceDetailModalService | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceDetailModal({
  service,
  isOpen,
  onClose,
}: ServiceDetailModalProps) {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!service || !isOpen) return null;

  const formatPrice = (price: number | null, priceType: string) => {
    if (priceType === "inquiry") {
      return "Inquiry Based";
    }
    if (price === null) {
      return "Contact for price";
    }
    return `₹${price.toLocaleString()}`;
  };

  // Helper functions to get category and subcategory names
  const getCategoryName = (service: ServiceDetailModalService): string => {
    if ("category_name" in service) {
      return service.category_name;
    }
    if ("category" in service && service.category) {
      return service.category.name;
    }
    return "Unknown Category";
  };

  const getSubcategoryName = (
    service: ServiceDetailModalService
  ): string | null => {
    if ("subcategory_name" in service) {
      return service.subcategory_name;
    }
    if ("subcategory" in service && service.subcategory) {
      return service.subcategory.name;
    }
    return null;
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal({ redirectTo: `/services/${service.id}/book` }));
      return;
    }
    // Close modal and navigate to booking
    onClose();
    window.location.href = `/services/${service.id}/book`;
  };

  const nextImage = () => {
    if (service.images && service.images.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % service.images!.length);
    }
  };

  const prevImage = () => {
    if (service.images && service.images.length > 1) {
      setSelectedImageIndex(
        (prev) => (prev - 1 + service.images!.length) % service.images!.length
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {service.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {getCategoryName(service)}
              {getSubcategoryName(service) &&
                ` • ${getSubcategoryName(service)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {/* Main Image */}
            <div className="relative mb-6">
              <div className="w-full h-64 bg-gray-50 rounded-xl overflow-hidden">
                {service.images && service.images.length > 0 ? (
                  <Image
                    src={service.images[selectedImageIndex]}
                    alt={service.name}
                    width={800}
                    height={256}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-300 text-4xl font-light">
                      {service.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Image Navigation */}
              {service.images && service.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {service.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Price and Duration */}
            <div className="mb-6">
              <div className="text-3xl font-semibold text-gray-900 mb-2">
                {formatPrice(service.price, service.price_type)}
              </div>
              {service.duration && (
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{service.duration}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {service.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {service.description}
                </p>
              </div>
            )}

            {/* Service Areas */}
            {service.service_areas && service.service_areas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Available Locations
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">Service available in:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {service.service_areas.slice(0, 6).map((area) => (
                    <span
                      key={area.id}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {area.city}, {area.state}
                    </span>
                  ))}
                  {service.service_areas.length > 6 && (
                    <span className="text-gray-500 text-sm">
                      +{service.service_areas.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Free cancellation up to 24 hours before service
            </div>
            <button
              onClick={handleBookNow}
              className="bg-[#00a871] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#008f5f] transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
