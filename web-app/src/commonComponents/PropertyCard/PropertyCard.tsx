"use client";

import Image from "next/image";
import { Property } from "@/types/property";
import { MapPin } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  className?: string;
  onClick?: () => void;
  onChatClick?: (property: Property) => void;
  currentUserId?: number;
}

export function PropertyCard({
  property,
  className = "",
  onClick,
}: PropertyCardProps) {
  if (!property || !property.ID) {
    return null;
  }

  const getDisplayPrice = () => {
    if (property.listing_type === "sale" && property.sale_price) {
      return `₹${property.sale_price.toLocaleString("en-IN")}`;
    } else if (property.listing_type === "rent" && property.monthly_rent) {
      return `₹${property.monthly_rent.toLocaleString("en-IN")}`;
    }
    return "Price not available";
  };

  const getDisplayLocation = () => {
    if (property.city && property.state) {
      return `${property.city}, ${property.state}`;
    }
    return property.city || property.state || "Location not available";
  };

  const getDefaultImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4NS4wNDcgMTUwIDE3MyAxMzcuOTUzIDE3MyAxMjNDMTczIDEwOC4wNDcgMTg1LjA0NyA5NiAyMDAgOTZDMjE0Ljk1MyA5NiAyMjcgMTA4LjA0NyAyMjcgMTIzQzIyNyAxMzcuOTUzIDIxNC45NTMgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMDAgMTgwQzE2NS42NDkgMTgwIDEzNyAxNjUuNjQ5IDEzNyAxNDdDMTM3IDEyOC4zNTEgMTY1LjY0OSAxMTQgMjAwIDExNEMyMzQuMzUxIDExNCAyNjMgMTI4LjM1MSAyNjMgMTQ3QzI2MyAxNjUuNjQ5IDIzNC4zNTEgMTgwIDIwMCAxODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
  };

  const primaryImage =
    property.images &&
    Array.isArray(property.images) &&
    property.images.length > 0
      ? property.images[0]
      : getDefaultImage();

  return (
    <div
      className={`group cursor-pointer mb-3 ${className}`}
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative w-full h-48 mb-2 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <Image
          src={primaryImage}
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
      </div>

      {/* Details Section */}
      <div>
        {/* Property Title */}
        <h3 className="text-sm font-semibold text-[#111928] mb-1 line-clamp-2">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center mb-2">
          <MapPin className="w-3 h-3 text-[#6B7280] mr-1 flex-shrink-0" />
          <p className="text-xs text-[#6B7280] truncate">
            {getDisplayLocation()}
          </p>
        </div>

        {/* Price */}
        <p className="text-base font-semibold text-[#00a871]">
          {getDisplayPrice()}
          {property.listing_type === "rent" && (
            <span className="text-xs text-[#6B7280] font-normal">
              {" "}
              /month
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export default PropertyCard;
