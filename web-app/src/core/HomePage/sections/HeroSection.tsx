"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { openSubcategoriesModal } from "@/store/slices/subcategoriesModalSlice";
import {
  useHeroConfig,
  // useCategoryIcons, // COMMENTED OUT as no longer used
  useHeroImages,
} from "@/hooks/useHeroData";

interface HeroSectionProps {
  className?: string;
}

// interface CategoryProps {
//   name: string;
//   icon: string;
//   categoryId: number;
// }

// CategoryCard component - COMMENTED OUT as it's no longer used
// const CategoryCard = ({ name, icon, categoryId }: CategoryProps) => {
//   const dispatch = useAppDispatch();

//   // Get the appropriate fallback icon based on category name
//   const getFallbackIcon = (categoryName: string) => {
//     const lowerName = categoryName.toLowerCase();
//     if (lowerName.includes("home")) {
//       return "/images/main-icons/home_service.png";
//     } else if (lowerName.includes("construction")) {
//       return "/images/main-icons/construction_service.png";
//     } else if (lowerName.includes("marketplace")) {
//       return "/images/main-icons/marketplace.png";
//     }
//     return `/images/main-icons/test-${categoryId}.png`;
//   };

//   const handleClick = () => {
//     // Open subcategories modal for Home Service and Construction Service
//     if (categoryId === 1 || categoryId === 2) {
//       dispatch(openSubcategoriesModal({ categoryId, categoryName: name }));
//     }
//     // Open marketplace modal for Marketplace
//     else if (name.toLowerCase().includes("marketplace")) {
//       dispatch(openMarketplaceModal());
//     } else {
//       // For other categories, you can add different logic here
//     }
//   };

//   return (
//     <div className="group cursor-pointer" onClick={handleClick}>
//       <div className="bg-[#f5f5f5] rounded-xl p-4 mb-3  transition-colors">
//         <Image
//           src={icon || getFallbackIcon(name)}
//           alt={name}
//           width={50}
//           height={50}
//           className="w-[50px] h-[50px] object-contain mx-auto"
//           onError={(e) => {
//             // Fallback to default icon if the uploaded icon fails to load
//             const target = e.target as HTMLImageElement;
//             const fallbackIcon = getFallbackIcon(name);
//             if (target.src !== fallbackIcon) {
//               target.src = fallbackIcon;
//             }
//           }}
//         />
//       </div>
//       <p className="text-gray-700 text-sm font-normal text-center">{name}</p>
//       <div className="w-0 group-hover:w-8 h-0.5 bg-[#00a871] mx-auto mt-2 transition-all duration-300"></div>
//     </div>
//   );
// };

export default function HeroSection({ className = "" }: HeroSectionProps) {
  const dispatch = useAppDispatch();

  // Fetch hero config, category icons, and hero images from backend
  const { data: heroConfigResponse, isLoading: heroConfigLoading } =
    useHeroConfig();
  // const { data: categoryIconsResponse, isLoading: categoryIconsLoading } =
  //   useCategoryIcons(); // COMMENTED OUT as no longer used
  const { data: heroImagesResponse, isLoading: heroImagesLoading } =
    useHeroImages();

  // Use backend data if available, otherwise fallback to props
  const heroConfig = heroConfigResponse?.data;
  // const categoryIcons = categoryIconsResponse?.data || []; // COMMENTED OUT as no longer used
  const heroImages = heroImagesResponse?.data || [];

  // State for carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 8000); // Change image every 8 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Get current hero media (from backend or fallback)
  const currentHeroMedia =
    heroImages.length > 0
      ? heroImages[currentImageIndex]
      : {
          image_url: "/images/others/maid11.jpg",
          media_url: "/images/others/maid11.jpg",
          media_type: "image" as const,
          alt: "Professional service platform",
        };

  // Get the media URL (with fallback to image_url for backward compatibility)
  const mediaUrl = currentHeroMedia.media_url || currentHeroMedia.image_url;
  const isVideo = currentHeroMedia.media_type === "video";

  // Map category icons to the expected format and reorder them - COMMENTED OUT as categories are no longer used
  // const categories: CategoryProps[] = categoryIcons
  //   .map((icon: HomepageCategoryIcon, index: number) => {
  //     // Get the appropriate fallback icon based on category name
  //     const getFallbackIcon = (categoryName: string) => {
  //       const lowerName = categoryName.toLowerCase();
  //       if (lowerName.includes("home")) {
  //         return "/images/main-icons/home_service.png";
  //       } else if (lowerName.includes("construction")) {
  //         return "/images/main-icons/construction_service.png";
  //       } else if (lowerName.includes("marketplace")) {
  //         return "/images/main-icons/marketplace.png";
  //       }
  //       return `/images/main-icons/test-${index + 1}.png`;
  //     };

  //     // Assign categoryId based on category name rather than index
  //     const getCategoryId = (categoryName: string) => {
  //       const lowerName = categoryName.toLowerCase();
  //       if (lowerName.includes("home")) return 1;
  //       if (lowerName.includes("construction")) return 2;
  //       if (lowerName.includes("marketplace")) return 3;
  //       return index + 1; // Fallback to original index for other categories
  //     };

  //     return {
  //       name: icon.name,
  //       icon: icon.icon_url || getFallbackIcon(icon.name),
  //       href: `#${icon.name.toLowerCase().replace(/\s+/g, "-")}`,
  //       categoryId: getCategoryId(icon.name),
  //     };
  //   })
  //   .sort((a, b) => {
  //     // Define the desired order: Home Service first, Construction Service second, Marketplace third
  //     const getOrder = (name: string) => {
  //       const lowerName = name.toLowerCase();
  //       if (lowerName.includes("home")) return 1;
  //       if (lowerName.includes("construction")) return 2;
  //       if (lowerName.includes("marketplace")) return 3;
  //       return 4; // Any other categories go last
  //     };

  //     return getOrder(a.name) - getOrder(b.name);
  //   });

  // Show loading state if data is being fetched
  if (heroConfigLoading || heroImagesLoading) {
    return (
      <section className={`w-full ${className} `}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
              <div className="border border-gray-200 rounded-2xl p-6">
                <div className="space-y-4 mb-8">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:pl-10">
              <div className="w-full aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full ${className} bg-white min-h-[80vh] flex items-center`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Tagline */}
            <div className="space-y-4">
              <p className="text-gray-800 text-4xl font-semibold leading-12">
                {heroConfig?.title || "Your Trusted Partner for All Services"}
              </p>
              {heroConfig?.description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {heroConfig.description}
                </p>
              )}
            </div>

            {/* Headline and Categories Section - COMMENTED OUT */}
            {/* <div className="border border-gray-200 rounded-2xl p-6 ">
              <div className="space-y-4 mb-8">
                <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                  {heroConfig?.prompt_text || "What are you looking for?"}
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.name} {...category} />
                ))}
              </div>
            </div> */}

            {/* Book Now Button */}
            <div className="flex justify-start">
              <button
                onClick={() =>
                  dispatch(
                    openSubcategoriesModal({
                      categoryId: 1,
                      categoryName: "Home Service",
                    })
                  )
                }
                className="bg-[#00a871] hover:bg-[#00865a] text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors duration-300 shadow-lg cursor-pointer"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Right Column - Hero Media (Image or Video) */}
          <div className="lg:pl-10">
            <div className="relative w-full aspect-square">
              {isVideo ? (
                <video
                  key={mediaUrl} // Force re-render when video changes
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="rounded-2xl w-full h-full object-cover border border-gray-200 shadow-lg"
                  onError={(e) => {
                    // Fallback to default image if video fails to load
                    const target = e.target as HTMLVideoElement;
                    console.error("Video failed to load:", target.src);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={mediaUrl}
                  alt={
                    "alt" in currentHeroMedia
                      ? currentHeroMedia.alt
                      : "Hero media"
                  }
                  width={500}
                  height={500}
                  className="rounded-2xl w-full h-full object-cover border border-gray-200 shadow-lg"
                  onError={(e) => {
                    // Fallback to default image if backend image fails to load
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("maid11.jpg")) {
                      target.src = "/images/others/maid11.jpg";
                    }
                  }}
                />
              )}

              {/* Carousel Controls */}
              {heroImages.length > 1 && (
                <>
                  {/* Bottom Indicators */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    {heroImages.map((media, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? "bg-white shadow-lg scale-110"
                            : "bg-white/60 hover:bg-white/80 hover:scale-105"
                        }`}
                        aria-label={`Go to ${media.media_type || "image"} ${
                          index + 1
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
