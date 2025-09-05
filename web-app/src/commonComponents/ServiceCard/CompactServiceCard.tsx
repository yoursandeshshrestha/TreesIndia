"use client";

import Image from "next/image";
import { SearchService } from "@/services/searchService";
import { Clock } from "lucide-react";

interface CompactServiceCardProps {
  service: SearchService;
  className?: string;
  onClick?: () => void;
}

export default function CompactServiceCard({
  service,
  className = "",
  onClick,
}: CompactServiceCardProps) {
  const formatPrice = (price: number | null, priceType: string) => {
    if (priceType === "inquiry") {
      return "Inquiry Based";
    }
    if (price === null) {
      return "Price on request";
    }
    return `₹${price.toLocaleString()}`;
  };

  // Format price type for display
  const formatPriceType = (priceType: string) => {
    return priceType === "fixed" ? "Fixed Price" : "Inquiry Based";
  };

  const getDefaultImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4NS4wNDcgMTUwIDE3MyAxMzcuOTUzIDE3MyAxMjNDMTczIDEwOC4wNDcgMTg1LjA0NyA5NiAyMDAgOTZDMjE0Ljk1MyA5NiAyMjcgMTA4LjA0NyAyMjcgMTIzQzIyNyAxMzcuOTUzIDIxNC45NTMgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMDAgMTgwQzE2NS42NDkgMTgwIDEzNyAxNjUuNjQ5IDEzNyAxNDdDMTM3IDEyOC4zNTEgMTY1LjY0OSAxMTQgMjAwIDExNEMyMzQuMzUxIDExNCAyNjMgMTI4LjM1MSAyNjMgMTQ3QzI2MyAxNjUuNjQ5IDIzNC4zNTEgMTgwIDIwMCAxODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
  };

  return (
    <div className={`group cursor-pointer ${className}`} onClick={onClick}>
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Service Image */}
        <div className="relative w-full h-24 overflow-hidden rounded-t-xl">
          <Image
            src={
              service.images && service.images.length > 0
                ? service.images[0]
                : getDefaultImage()
            }
            alt={service.name}
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

        {/* Service Details */}
        <div className="p-3">
          {/* Service Name */}
          <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
            {service.name}
          </h3>

          {/* Price Type and Duration */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-green-600 text-xs font-medium">
              {formatPriceType(service.price_type)}
            </span>
            {service.duration && (
              <div className="flex items-center text-gray-500 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {service.duration}
              </div>
            )}
          </div>

          {/* Price */}
          <span className="text-gray-600 text-xs">
            {formatPrice(service.price ?? null, service.price_type)}
          </span>
        </div>
      </div>
    </div>
  );
}
