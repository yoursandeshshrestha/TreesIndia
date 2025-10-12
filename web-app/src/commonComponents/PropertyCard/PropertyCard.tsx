"use client";

import Image from "next/image";
import { Property } from "@/types/property";
import { MapPin, Bed, Bath, Images, MessageCircle } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  className?: string;
  onClick?: () => void;
  onChatClick?: (property: Property) => void;
  currentUserId?: number;
}

export default function PropertyCard({
  property,
  className = "",
  onClick,
  onChatClick,
  currentUserId,
}: PropertyCardProps) {
  // Ensure property has a valid ID before rendering
  if (!property || !property.ID) {
    return null;
  }

  const handleChatClick = () => {
    if (onChatClick) {
      onChatClick(property);
    }
  };

  // Check if current user is the same as the property owner
  const isCurrentUserOwner =
    currentUserId && currentUserId === property.user_id;
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

  const getStatusBadge = () => {
    if (property.status === "sold") {
      return (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-300">
            Sold
          </span>
        </div>
      );
    }
    if (property.status === "rented") {
      return (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-300">
            Rented
          </span>
        </div>
      );
    }
    return null;
  };

  const getNegotiableBadge = () => {
    if (property.price_negotiable) {
      return (
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-300">
            Negotiable
          </span>
        </div>
      );
    }
    return null;
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

  return (
    <div className={`group cursor-pointer ${className}`} onClick={onClick}>
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        {/* Property Image */}
        <div className="relative w-full h-48 sm:h-56 md:h-60 overflow-hidden">
          <Image
            src={
              property.images && property.images.length > 0
                ? property.images[0]
                : getDefaultImage()
            }
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes("data:image/svg+xml")) {
                target.src = getDefaultImage();
              }
            }}
          />
          {/* Status Badge */}
          {getStatusBadge()}
          {/* Negotiable Badge */}
          {getNegotiableBadge()}

          {/* Image Count */}
          {property.images && property.images.length > 1 && (
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
              <span className="bg-gray-800 bg-opacity-80 text-white text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center">
                <Images className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                {property.images.length}
              </span>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="p-3 sm:p-4">
          {/* Property Title */}
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {property.city && property.state
                ? `${property.city}, ${property.state}`
                : property.city || property.state || "Location not specified"}
            </span>
          </div>

          {/* Property Configuration */}
          {(property.bedrooms || property.bathrooms) && (
            <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-3">
              {property.bedrooms && (
                <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                  <Bed className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                  <Bath className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mb-3 sm:mb-4">
            <div className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {formatPrice(property)}
            </div>
            {property.age && (
              <div className="text-xs text-gray-500 mt-1">
                {formatAge(property.age)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            {!isCurrentUserOwner && (
              <button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChatClick();
                }}
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Chat</span>
              </button>
            )}
            <button
              className={`${
                isCurrentUserOwner ? "w-full" : "flex-1"
              } bg-white text-black border border-gray-300 hover:bg-gray-50 font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm`}
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
              }}
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
