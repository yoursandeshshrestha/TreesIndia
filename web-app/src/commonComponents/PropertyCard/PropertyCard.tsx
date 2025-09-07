"use client";

import Image from "next/image";
import { Property } from "@/types/property";
import { MapPin } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  className?: string;
  onClick?: () => void;
}

export default function PropertyCard({
  property,
  className = "",
  onClick,
}: PropertyCardProps) {
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

  const getListingTypeText = () => {
    return property.listing_type === "sale" ? "For Sale" : "For Rent";
  };

  return (
    <div className={`group cursor-pointer ${className}`} onClick={onClick}>
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Property Image */}
        <div className="relative w-full h-60 overflow-hidden rounded-xl">
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
        </div>

        {/* Property Details */}
        <div className="p-3">
          {/* Property Name */}
          <h3 className="font-medium text-gray-900 text-base mb-1">
            {property.title}
          </h3>

          {/* Listing Type and Location */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-green-600 text-sm font-medium">
              {getListingTypeText()}
            </span>
            <div className="flex items-center text-gray-500 text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {property.city}
            </div>
          </div>

          {/* Price */}
          <span className="text-gray-600 text-sm">{formatPrice(property)}</span>
        </div>
      </div>
    </div>
  );
}
