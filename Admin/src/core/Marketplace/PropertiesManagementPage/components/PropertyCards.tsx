"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Check,
  X,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Shield,
  Home,
  IndianRupee,
  Award,
  CheckCircle,
  User,
  Mail,
  Phone,
} from "lucide-react";
import Badge from "@/components/Badge/Badge";
import Button from "@/components/Button/Base/Button";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import { Property, PropertyStatus, PropertyType, ListingType } from "../types";

interface PropertyCardsProps {
  properties: Property[];
  isLoading: boolean;
  onViewProperty: (property: Property) => void;
  onApproveProperty?: (propertyId: number) => Promise<void>;
  onRejectProperty?: (propertyId: number) => Promise<void>;
}

export default function PropertyCards({
  properties,
  isLoading,
  onApproveProperty,
}: PropertyCardsProps) {
  const router = useRouter();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  const handleApproveClick = (property: Property) => {
    setSelectedProperty(property);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (selectedProperty && onApproveProperty) {
      await onApproveProperty(selectedProperty.ID);
      setIsApproveModalOpen(false);
      setSelectedProperty(null);
    }
  };

  const getStatusBadge = (status: PropertyStatus) => {
    const statusConfig = {
      available: { variant: "success" as const, label: "Available" },
      sold: { variant: "danger" as const, label: "Sold" },
      rented: { variant: "primary" as const, label: "Rented" },
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: PropertyType) => {
    const typeConfig = {
      residential: { variant: "primary" as const, label: "Residential" },
      commercial: { variant: "secondary" as const, label: "Commercial" },
    };

    const config = typeConfig[type] || typeConfig.residential;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getListingTypeBadge = (type: ListingType) => {
    const typeConfig = {
      sale: { variant: "success" as const, label: "For Sale" },
      rent: { variant: "warning" as const, label: "For Rent" },
    };

    const config = typeConfig[type] || typeConfig.sale;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (property: Property) => {
    if (property.listing_type === "sale" && property.sale_price) {
      return `₹${property.sale_price.toLocaleString()}`;
    } else if (property.listing_type === "rent" && property.monthly_rent) {
      return `₹${property.monthly_rent.toLocaleString()}/month`;
    }
    return "Price on request";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getImageUrl = (imageUrl: string) => {
    // If it's already a complete URL, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // If it's a relative path, prepend the base URL
    return imageUrl;
  };

  const getPlaceholderImage = (property: Property) => {
    // Generate a placeholder image URL based on property details
    const title = encodeURIComponent(property.title);

    // Use a placeholder service that can generate property images
    return `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${title}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
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
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Home className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or create a new property.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <div
          key={property.ID}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer"
          onClick={() =>
            router.push(`/dashboard/marketplace/rental-property/${property.ID}`)
          }
        >
          {/* Property Image */}
          <div className="relative h-48 bg-gray-100">
            {property.images && property.images.length > 0 ? (
              <img
                src={getImageUrl(property.images[0])}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", property.images[0]);
                  console.error("Error details:", e);
                  const target = e.target as HTMLImageElement;
                  // Try to load placeholder image instead
                  target.src = getPlaceholderImage(property);
                  target.onerror = () => {
                    // If placeholder also fails, show the fallback icon
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                          </svg>
                        </div>
                      `;
                    }
                  };
                }}
                onLoad={() => {}}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Home size={48} className="text-gray-400" />
              </div>
            )}

            {/* Status and Type Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {getStatusBadge(property.status)}
              {getTypeBadge(property.property_type)}
            </div>

            {/* Listing Type Badge */}
            <div className="absolute top-3 right-3">
              {getListingTypeBadge(property.listing_type)}
            </div>
          </div>

          {/* Property Content */}
          <div className="p-4 flex flex-col flex-grow">
            {/* Main Content */}
            <div className="flex-grow space-y-3">
              {/* Property Title and Description */}
              <div>
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                  {property.title}
                </h3>
                {property.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {property.description}
                  </p>
                )}
              </div>

              {/* Property Details */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed size={14} />
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath size={14} />
                    <span>{property.bathrooms}</span>
                  </div>
                )}
                {property.area && (
                  <div className="flex items-center gap-1">
                    <Square size={14} />
                    <span>{property.area} sq ft</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div>
                    {property.city}, {property.state}
                  </div>
                  {property.address && (
                    <div className="text-xs text-gray-500">
                      {property.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-2">
                <IndianRupee size={14} className="text-gray-600" />
                <span className="font-semibold text-gray-900">
                  {formatPrice(property)}
                </span>
                {property.price_negotiable && (
                  <Badge variant="secondary" className="text-xs">
                    Negotiable
                  </Badge>
                )}
              </div>

              {/* Approval Status */}
              <div className="flex items-center gap-2 flex-wrap">
                {property.is_approved ? (
                  <Badge variant="success" className="text-xs">
                    <Check size={12} className="mr-1" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-xs">
                    <X size={12} className="mr-1" />
                    Pending
                  </Badge>
                )}
                {property.uploaded_by_admin && (
                  <Badge variant="primary" className="text-xs">
                    <Shield size={12} className="mr-1" />
                    Admin
                  </Badge>
                )}
                {property.treesindia_assured && (
                  <Badge
                    variant="success"
                    className="text-xs bg-green-100 text-green-800 border-green-200"
                  >
                    <Award size={12} className="mr-1" />
                    TreesIndia Assured
                  </Badge>
                )}
              </div>

              {/* Uploaded By User Information */}
              {property.user && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User size={14} />
                    <span>Uploaded by</span>
                  </div>
                  <div className="space-y-1">
                    {property.user.name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={12} />
                        <span className="font-medium">
                          {property.user.name}
                        </span>
                      </div>
                    )}
                    {property.user.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={12} />
                        <span>{property.user.email}</span>
                      </div>
                    )}
                    {property.user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={12} />
                        <span>{property.user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Approve Button for Pending Properties */}
              {!property.is_approved && onApproveProperty && (
                <div className="pt-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproveClick(property);
                    }}
                    leftIcon={<CheckCircle size={14} />}
                    className="w-full"
                  >
                    Approve Property
                  </Button>
                </div>
              )}
            </div>

            {/* Created Date and View Details - Always at bottom */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 mt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar size={12} />
                <span>Created {formatDate(property.CreatedAt)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/dashboard/marketplace/rental-property/${property.ID}`
                  );
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Eye size={12} />
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedProperty(null);
        }}
        onConfirm={handleConfirmApprove}
        title="Approve Property"
        message={`Are you sure you want to approve "${selectedProperty?.title}"? This action will make the property visible to users.`}
        confirmText="Approve"
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
}
