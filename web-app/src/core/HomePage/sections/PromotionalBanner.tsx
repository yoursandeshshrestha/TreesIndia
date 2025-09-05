"use client";

import Image from "next/image";
import { usePromotionBanners } from "@/hooks/usePromotionBanners";
import { PromotionBanner as PromotionBannerType } from "@/types/api";

interface PromotionalBannerProps {
  className?: string;
  backgroundColor?: string;
}

const PromotionalCard = ({ banner }: { banner: PromotionBannerType }) => {
  // Only render if banner has a valid image
  if (!banner.image || banner.image.trim() === "") {
    return null;
  }

  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => window.open(banner.link, "_blank")}
    >
      <div className="relative overflow-hidden border border-gray-200 shadow-xs rounded-xl">
        {/* Background Image */}
        <Image
          src={banner.image}
          alt={banner.title}
          width={400}
          height={100}
          className="w-full h-auto max-h-48 object-cover transition-transform duration-300 group-hover:scale-102"
          onError={(e) => {
            // Hide the entire card if image fails to load
            const target = e.target as HTMLImageElement;
            const cardElement = target.closest(
              ".relative.group"
            ) as HTMLElement;
            if (cardElement) {
              cardElement.style.display = "none";
            }
          }}
        />
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 h-48 rounded-xl"></div>
      </div>
    ))}
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) => (
  <div className="text-center py-8">
    <p className="text-red-600 mb-4">
      Failed to load promotional banners: {error.message}
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

export default function PromotionalBanner({
  className = "",
  backgroundColor = "bg-white",
}: PromotionalBannerProps) {
  const { data: banners, isLoading, error, refetch } = usePromotionBanners();

  if (isLoading) {
    return (
      <section className={`w-full py-8 ${backgroundColor} ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`w-full py-8 ${backgroundColor} ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <ErrorState error={error} onRetry={() => refetch()} />
        </div>
      </section>
    );
  }

  if (!banners || banners.length === 0) {
    return null; // Don't render anything if no banners
  }

  // Filter out banners that don't have valid images or links
  const validBanners = banners.filter(
    (banner) =>
      banner.image &&
      banner.image.trim() !== "" &&
      banner.link &&
      banner.link.trim() !== ""
  );

  if (validBanners.length === 0) {
    return null; // Don't render anything if no valid banners
  }

  return (
    <section className={`w-full py-8 ${backgroundColor} ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Banner Container */}
        <div className="relative">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {validBanners.map((banner) => (
              <PromotionalCard key={banner.id} banner={banner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
