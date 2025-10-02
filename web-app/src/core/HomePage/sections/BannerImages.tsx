"use client";

import Image from "next/image";
import { useBannerImages } from "@/hooks/useBannerImages";
import { BannerImage as BannerImageType } from "@/types/api";

interface BannerImagesProps {
  className?: string;
  backgroundColor?: string;
  bannerIndex?: number;
}

const BannerCard = ({ banner }: { banner: BannerImageType }) => {
  // Only render if banner has a valid image
  if (!banner.image || banner.image.trim() === "") {
    return null;
  }

  const handleClick = () => {
    if (banner.link && banner.link.trim() !== "") {
      window.open(banner.link, "_blank");
    }
  };

  return (
    <div
      className={`relative group ${banner.link ? "cursor-pointer" : ""}`}
      onClick={handleClick}
    >
      <div className="relative overflow-hidden border border-gray-200 shadow-sm rounded-xl">
        {/* Background Image - Full Width */}
        <Image
          src={banner.image}
          alt={banner.title}
          width={1200}
          height={300}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-101 cursor-pointer"
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
  <div className="animate-pulse">
    <div className="bg-gray-200 h-48 rounded-xl"></div>
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
      Failed to load banner images: {error.message}
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

export default function BannerImages({
  className = "",
  backgroundColor = "bg-white",
  bannerIndex = 0,
}: BannerImagesProps) {
  const { data: banners, isLoading, error, refetch } = useBannerImages();

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

  // Filter out banners that don't have valid images
  const validBanners = banners.filter(
    (banner) => banner.image && banner.image.trim() !== ""
  );

  if (validBanners.length === 0) {
    return null; // Don't render anything if no valid banners
  }

  // Get the specific banner at the given index
  const targetBanner = validBanners[bannerIndex];

  if (!targetBanner) {
    return null; // Don't render if no banner at this index
  }

  return (
    <section className={`w-full py-8 ${backgroundColor} ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Banner Container */}
        <div className="relative">
          {/* Single Banner Display */}
          <div className="relative">
            <BannerCard banner={targetBanner} />
          </div>
        </div>
      </div>
    </section>
  );
}
