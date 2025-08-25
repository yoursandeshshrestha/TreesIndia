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
    return "/images/others/placeholder.svg";
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
              target.src = getDefaultImage(service.category_name);
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
