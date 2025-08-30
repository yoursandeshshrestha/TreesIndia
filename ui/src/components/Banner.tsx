import React from "react";

interface BannerItem {
  id: string;
  image: string;
}

interface BannerProps {
  items: BannerItem[];
  className?: string;
}

const Banner: React.FC<BannerProps> = ({ items, className = "" }) => {
  return (
    <div className={`px-4 mb-6 ${className}`}>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar">
        {items.map((item) => (
          <div
            key={item.id}
            className="min-w-[280px] h-32 rounded-xl overflow-hidden flex-shrink-0"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/banner/fallback-banner.jpg";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banner;
