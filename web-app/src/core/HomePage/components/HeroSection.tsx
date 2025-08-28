"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Hero as HeroType } from "@/types/treesindia";
import { useAppDispatch } from "@/store/hooks";
import { openSubcategoriesModal } from "@/store/slices/subcategoriesModalSlice";
import {
  useHeroConfig,
  useCategoryIcons,
  useHeroImages,
} from "@/hooks/useHeroData";
import { HomepageCategoryIcon, HeroImage } from "@/types/hero";

interface HeroSectionProps {
  data: HeroType;
  className?: string;
}

interface CategoryProps {
  name: string;
  icon: string;
  href: string;
  categoryId: number;
}

const CategoryCard = ({ name, icon, href, categoryId }: CategoryProps) => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    // Only open modal for Home Service and Construction Service
    if (categoryId === 1 || categoryId === 2) {
      dispatch(openSubcategoriesModal({ categoryId, categoryName: name }));
    } else {
      // For other categories, you can add different logic here
    }
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="bg-gray-100 rounded-xl p-4 mb-3 hover:bg-gray-200 transition-colors">
        <Image
          src={icon}
          alt={name}
          width={50}
          height={50}
          className="w-[50px] h-[50px] object-contain mx-auto"
          onError={(e) => {
            // Fallback to default icon if the uploaded icon fails to load
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("test-")) {
              target.src = `/images/main-icons/test-${categoryId}.png`;
            }
          }}
        />
      </div>
      <p className="text-gray-700 text-sm font-normal text-center">{name}</p>
      <div className="w-0 group-hover:w-8 h-0.5 bg-[#00a871] mx-auto mt-2 transition-all duration-300"></div>
    </div>
  );
};

export default function HeroSection({
  data,
  className = "",
}: HeroSectionProps) {
  // Fetch hero config, category icons, and hero images from backend
  const { data: heroConfigResponse, isLoading: heroConfigLoading } =
    useHeroConfig();
  const { data: categoryIconsResponse, isLoading: categoryIconsLoading } =
    useCategoryIcons();
  const { data: heroImagesResponse, isLoading: heroImagesLoading } =
    useHeroImages();

  // Use backend data if available, otherwise fallback to props
  const heroConfig = heroConfigResponse?.data;
  const categoryIcons = categoryIconsResponse?.data || [];
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

  // Get current hero image (from backend or fallback)
  const currentHeroImage =
    heroImages.length > 0
      ? heroImages[currentImageIndex]
      : { image_url: data.heroImage.src, alt: data.heroImage.alt };

  // Map category icons to the expected format
  const categories: CategoryProps[] = categoryIcons.map(
    (icon: HomepageCategoryIcon, index: number) => ({
      name: icon.name,
      icon: icon.icon_url || `/images/main-icons/test-${index + 1}.png`,
      href: `#${icon.name.toLowerCase().replace(/\s+/g, "-")}`,
      categoryId: index + 1,
    })
  );

  // Show loading state if data is being fetched
  if (heroConfigLoading || categoryIconsLoading || heroImagesLoading) {
    return (
      <section className={`w-full ${className}`}>
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
    <section className={`w-full ${className}`}>
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

            {/* Headline and Categories Section */}
            <div className="border border-gray-200 rounded-2xl p-6 ">
              {/* Headline */}
              <div className="space-y-4 mb-8">
                <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                  {heroConfig?.prompt_text || data.headline.primary}
                </h1>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.name} {...category} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="lg:pl-10">
            <div className="relative w-full aspect-square">
              <Image
                src={currentHeroImage.image_url}
                alt={currentHeroImage.alt || "Hero image"}
                width={500}
                height={500}
                className="rounded-2xl w-full h-full object-cover border border-gray-200 shadow-lg"
                onError={(e) => {
                  // Fallback to default image if backend image fails to load
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("maid11.jpg")) {
                    target.src = data.heroImage.src;
                  }
                }}
              />

              {/* Carousel Controls */}
              {heroImages.length > 1 && (
                <>
                  {/* Bottom Indicators */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? "bg-white shadow-lg scale-110"
                            : "bg-white/60 hover:bg-white/80 hover:scale-105"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
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
