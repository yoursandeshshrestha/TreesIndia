"use client";

import Image from "next/image";
import { PopularService } from "@/types/api";

interface ServiceCardProps {
  service: PopularService;
  className?: string;
  onClick?: () => void;
}

export default function ServiceCard({
  service,
  className = "",
  onClick,
}: ServiceCardProps) {
  const formatPrice = (price: number | null, priceType: string) => {
    if (priceType === "inquiry") {
      return "Inquiry Based";
    }
    if (price === null) {
      return "Price on request";
    }
    return `₹${price.toLocaleString()}`;
  };

  const getDefaultImage = (categoryName: string) => {
    // Return a data URL for a simple placeholder instead of a file path
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4NS4wNDcgMTUwIDE3MyAxMzcuOTUzIDE3MyAxMjNDMTczIDEwOC4wNDcgMTg1LjA0NyA5NiAyMDAgOTZDMjE0Ljk1MyA5NiAyMjcgMTA4LjA0NyAyMjcgMTIzQzIyNyAxMzcuOTUzIDIxNC45NTMgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMDAgMTgwQzE2NS42NDkgMTgwIDEzNyAxNjUuNjQ5IDEzNyAxNDdDMTM3IDEyOC4zNTEgMTY1LjY0OSAxMTQgMjAwIDExNEMyMzQuMzUxIDExNCAyNjMgMTI4LjM1MSAyNjMgMTQ3QzI2MyAxNjUuNjQ5IDIzNC4zNTEgMTgwIDIwMCAxODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
  };

  return (
    <div className={`group cursor-pointer ${className}`} onClick={onClick}>
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Service Image */}
        <div className="relative w-full h-60 overflow-hidden rounded-xl">
          <Image
            src={
              service.images && service.images.length > 0
                ? service.images[0]
                : getDefaultImage(service.category_name)
            }
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              // Only set the fallback if it's not already the fallback image
              if (!target.src.includes("data:image/svg+xml")) {
                target.src = getDefaultImage(service.category_name);
              }
            }}
          />
        </div>

        {/* Service Details */}
        <div className="p-3">
          {/* Service Name */}
          <h3 className="font-medium text-gray-900 text-base mb-1">
            {service.name}
          </h3>

          {/* Price */}
          <span className="text-gray-600 text-sm">
            {formatPrice(service.price, service.price_type)}
          </span>
        </div>
      </div>
    </div>
  );
}
