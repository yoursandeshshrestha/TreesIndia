"use client";

import Image from "next/image";
import { Property } from "@/types/property";
import { Calendar, Eye, Trash2, Images } from "lucide-react";

interface MyPropertyCardProps {
  property: Property;
  onView: (propertyId: number) => void;
  onDelete: (propertyId: number) => void;
  className?: string;
}

export default function MyPropertyCard({
  property,
  onView,
  onDelete,
  className = "",
}: MyPropertyCardProps) {
  // Ensure property has a valid ID before rendering
  if (!property || !property.ID) {
    return null;
  }

  const formatPrice = (property: Property) => {
    if (property.listing_type === "sale" && property.sale_price) {
      return `₹${property.sale_price.toLocaleString()}`;
    }
    if (property.listing_type === "rent" && property.monthly_rent) {
      return `₹${property.monthly_rent.toLocaleString()}/month`;
    }
    return "Price on request";
  };

  const getDefaultImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4NS4wNDcgMTUwIDE3MyAxMzcuOTUzIDE3MyAxMjNDMTczIDEwOC4wNDcgMTg1LjA0NyA5NiAyMDAgOTZDMjE0Ljk1MyA5NiAyMjcgMTA4LjA0NyAyMjcgMTIzQzIyNyAxMzcuOTUzIDIxNC45NTMgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMDAgMTgwQzE2NS42NDkgMTgwIDEzNyAxNjUuNjQ5IDEzNyAxNDdDMTM3IDEyOC4zNTEgMTY1LjY0OSAxMTQgMjAwIDExNEMyMzQuMzUxIDExNCAyNjMgMTI4LjM1MSAyNjMgMTQ3QzI2MyAxNjUuNjQ5IDIzNC4zNTEgMTgwIDIwMCAxODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
  };

  const getPricePerSqft = () => {
    if (
      property.listing_type === "sale" &&
      property.sale_price &&
      property.area
    ) {
      return `₹${Math.round(
        property.sale_price / property.area
      ).toLocaleString()} /sqft`;
    }
    if (
      property.listing_type === "rent" &&
      property.monthly_rent &&
      property.area
    ) {
      return `₹${Math.round(
        property.monthly_rent / property.area
      ).toLocaleString()} /sqft`;
    }
    return null;
  };

  const getAreaInSqm = () => {
    if (property.area) {
      return Math.round(property.area * 0.092903).toLocaleString();
    }
    return null;
  };

  const getPropertyDescription = () => {
    if (property.description) {
      return property.description.length > 120
        ? property.description.substring(0, 120) + "..."
        : property.description;
    }
    return "Property details available on request";
  };

  const formatAge = (age: string | null) => {
    if (!age) return null;

    switch (age) {
      case "under_1_year":
        return "Under 1 year";
      case "1_year":
        return "1 year";
      case "1_2_years":
        return "1-2 years";
      case "2_3_years":
        return "2-3 years";
      case "3_5_years":
        return "3-5 years";
      case "5_10_years":
        return "5-10 years";
      case "over_10_years":
        return "Over 10 years";
      default:
        return age.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const getTimeAgo = () => {
    const dateField =
      property.CreatedAt ||
      property.UpdatedAt ||
      property.created_at ||
      property.updated_at;

    if (dateField) {
      const createdDate = new Date(dateField);
      const now = new Date();
      const diffInMs = now.getTime() - createdDate.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        if (diffInHours === 0) {
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
          if (diffInMinutes === 0) return "Just now";
          return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
        }
        return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
      }
      if (diffInDays === 1) return "1 day ago";
      if (diffInDays < 7)
        return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
      if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
      }
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months === 1 ? "" : "s"} ago`;
    }
    return "Posted recently";
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "rented":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`${className}`}>
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
        <div className="flex flex-col md:flex-row">
          {/* Property Image - Left Side */}
          <div className="relative w-full md:w-80 h-48 md:h-auto overflow-hidden flex-shrink-0">
            <Image
              src={
                property.images && property.images.length > 0
                  ? property.images[0]
                  : getDefaultImage()
              }
              alt={property.title}
              fill
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 320px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("data:image/svg+xml")) {
                  target.src = getDefaultImage();
                }
              }}
            />

            {/* Trees India Assured Badge */}
            {property.treesindia_assured && (
              <div className="absolute top-3 left-3">
                <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Trees India Assured
                </span>
              </div>
            )}

            {/* Image Count */}
            {property.images && property.images.length > 1 && (
              <div className="absolute bottom-3 right-3">
                <span className="bg-gray-800 bg-opacity-80 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center">
                  <Images className="w-3 h-3 mr-1" />
                  {property.images.length}
                </span>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  property.status
                )}`}
              >
                {property.is_approved ? "Approved" : "Pending"}
              </span>
            </div>
          </div>

          {/* Property Details - Right Side */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-600 text-sm mb-1">
                    {property.locality || property.city}, {property.state}
                  </h3>
                  <p className="text-gray-700 text-lg font-semibold">
                    {property.title}
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="flex items-center space-x-6 mb-4">
                {/* Price */}
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(property)}
                  </div>
                  {getPricePerSqft() && (
                    <div className="text-xs text-gray-600">
                      {getPricePerSqft()}
                    </div>
                  )}
                </div>

                {/* Divider */}
                {(property.area ||
                  (property.bedrooms && property.bathrooms)) && (
                  <div className="w-px h-12 bg-gray-300"></div>
                )}

                {/* Area */}
                {property.area && (
                  <>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">
                        <span className="font-bold">{property.area} sqft</span>
                        {getAreaInSqm() && (
                          <span className="font-normal text-[13px]">
                            {" "}
                            ({getAreaInSqm()} sqm)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Carpet Area</div>
                    </div>

                    {/* Divider */}
                    {property.bedrooms && property.bathrooms && (
                      <div className="w-px h-12 bg-gray-300"></div>
                    )}
                  </>
                )}

                {/* Configuration */}
                {property.bedrooms && property.bathrooms && (
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-900">
                      {property.bedrooms} BHK ({property.bathrooms} Baths)
                    </div>
                    <div className="text-xs text-gray-600">
                      {property.age ? formatAge(property.age) : "Ready To Move"}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {getPropertyDescription()}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{getTimeAgo()}</span>
                  </div>
                  {property.expires_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Expires:{" "}
                      {new Date(property.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(property.ID)}
                    className="p-2 text-gray-400 rounded-lg"
                    title="View Property"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(property.ID)}
                    className="p-2 text-gray-400 rounded-lg"
                    title="Delete Property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
