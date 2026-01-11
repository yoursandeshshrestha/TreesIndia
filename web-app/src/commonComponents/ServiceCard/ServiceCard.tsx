"use client";

import Image from "next/image";
import { PopularService, Service } from "@/types/api";

type ServiceCardService = PopularService | Service;

interface ServiceCardProps {
  service: ServiceCardService;
  className?: string;
  onClick?: () => void;
}

export default function ServiceCard({
  service,
  className = "",
  onClick,
}: ServiceCardProps) {
  const getDisplayPrice = () => {
    if (service.price_type === "fixed" && service.price) {
      return `Starts at ₹${service.price.toLocaleString("en-IN")}`;
    }
    return "Inquiry";
  };

  const getDefaultImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4NS4wNDcgMTUwIDE3MyAxMzcuOTUzIDE3MyAxMjNDMTczIDEwOC4wNDcgMTg1LjA0NyA5NiAyMDAgOTZDMjE0Ljk1MyA5NiAyMjcgMTA4LjA0NyAyMjcgMTIzQzIyNyAxMzcuOTUzIDIxNC45NTMgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMDAgMTgwQzE2NS42NDkgMTgwIDEzNyAxNjUuNjQ5IDEzNyAxNDdDMTM3IDEyOC4zNTEgMTY1LjY0OSAxMTQgMjAwIDExNEMyMzQuMzUxIDExNCAyNjMgMTI4LjM1MSAyNjMgMTQ3QzI2MyAxNjUuNjQ5IDIzNC4zNTEgMTgwIDIwMCAxODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
  };

  const primaryImage =
    service.images && service.images.length > 0
      ? service.images[0]
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

      {/* Details Section */}
      <div>
        {/* Service Name */}
        <h3 className="text-sm font-semibold text-[#111928] mb-2 line-clamp-2">
          {service.name}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-[#00a871]">
            {getDisplayPrice()}
          </p>
        </div>

        {/* Duration (if available) */}
        {service.duration && (
          <p className="text-xs text-[#6B7280] mt-1">{service.duration}</p>
        )}
      </div>
    </div>
  );
}
