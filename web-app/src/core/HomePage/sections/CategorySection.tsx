"use client";

import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { openSubcategoriesModal } from "@/store/slices/subcategoriesModalSlice";
import { openMarketplaceModal } from "@/store/slices/marketplaceModalSlice";
import { useCategoryIcons } from "@/hooks/useHeroData";

interface CategoryProps {
  name: string;
  icon: string;
  categoryId: number;
}

interface CategorySectionProps {
  className?: string;
  backgroundColor?: string;
}

// CategoryCard component
const CategoryCard = ({ name, icon, categoryId }: CategoryProps) => {
  const dispatch = useAppDispatch();

  // Get the appropriate fallback icon based on category name
  const getFallbackIcon = (categoryName: string) => {
    const lowerName = categoryName.toLowerCase();
    if (lowerName.includes("home")) {
      return "/images/main-icons/home_service.png";
    } else if (lowerName.includes("construction")) {
      return "/images/main-icons/construction_service.png";
    } else if (lowerName.includes("marketplace")) {
      return "/images/main-icons/marketplace.png";
    }
    return `/images/main-icons/test-${categoryId}.png`;
  };

  const handleClick = () => {
    // Open subcategories modal for Home Service and Construction Service
    if (categoryId === 1 || categoryId === 2) {
      dispatch(openSubcategoriesModal({ categoryId, categoryName: name }));
    }
    // Open marketplace modal for Marketplace
    else if (name.toLowerCase().includes("marketplace")) {
      dispatch(openMarketplaceModal());
    }
    // For other categories, you can add different logic here
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="bg-[#f5f5f5] rounded-xl p-4 mb-3 transition-colors">
        <Image
          src={icon || getFallbackIcon(name)}
          alt={name}
          width={50}
          height={50}
          className="w-[50px] h-[50px] object-contain mx-auto"
          onError={(e) => {
            // Fallback to default icon if the uploaded icon fails to load
            const target = e.target as HTMLImageElement;
            const fallbackIcon = getFallbackIcon(name);
            if (target.src !== fallbackIcon) {
              target.src = fallbackIcon;
            }
          }}
        />
      </div>
      <p className="text-gray-700 text-sm font-normal text-center">{name}</p>
      <div className="w-0 group-hover:w-8 h-0.5 bg-[#00a871] mx-auto mt-2 transition-all duration-300"></div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {[1, 2].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-[#f5f5f5] rounded-xl p-4 mb-3">
          <div className="w-[50px] h-[50px] bg-gray-300 rounded mx-auto"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        <div className="h-0.5 bg-gray-200 rounded w-8 mx-auto mt-2"></div>
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
      Failed to load categories: {error.message}
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

export default function CategorySection({
  className = "",
  backgroundColor = "bg-white",
}: CategorySectionProps) {
  const {
    data: categoryIconsResponse,
    isLoading,
    error,
    refetch,
  } = useCategoryIcons();

  if (isLoading) {
    return (
      <section className={`w-full py-8 ${backgroundColor} ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Image Loading */}
            <div className="lg:pr-10">
              <div className="w-full aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>

            {/* Right Column - Categories Loading */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="space-y-4 mb-8">
                <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>
              <LoadingSkeleton />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`w-full py-8 ${backgroundColor} ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Image */}
            <div className="lg:pr-10">
              <div className="relative w-full aspect-square">
                {/* Image for small screens */}
                <Image
                  src="/images/others/other-we-provide-down.png"
                  alt="Other services we provide"
                  width={500}
                  height={500}
                  className="rounded-2xl w-full h-full object-cover lg:hidden"
                />
                {/* Image for large screens */}
                <Image
                  src="/images/others/other-we-provide.png"
                  alt="Other services we provide"
                  width={500}
                  height={500}
                  className="rounded-2xl w-full h-full object-cover hidden lg:block"
                />
              </div>
            </div>

            {/* Right Column - Error */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <ErrorState error={error} onRetry={() => refetch()} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const categoryIcons = categoryIconsResponse?.data || [];

  if (!categoryIcons || categoryIcons.length === 0) {
    return null; // Don't render anything if no categories
  }

  // Map category icons to the expected format and reorder them
  const categories: CategoryProps[] = categoryIcons
    .map((icon, index: number) => {
      // Get the appropriate fallback icon based on category name
      const getFallbackIcon = (categoryName: string) => {
        const lowerName = categoryName.toLowerCase();
        if (lowerName.includes("home")) {
          return "/images/main-icons/home_service.png";
        } else if (lowerName.includes("construction")) {
          return "/images/main-icons/construction_service.png";
        } else if (lowerName.includes("marketplace")) {
          return "/images/main-icons/marketplace.png";
        }
        return `/images/main-icons/test-${index + 1}.png`;
      };

      // Assign categoryId based on category name rather than index
      const getCategoryId = (categoryName: string) => {
        const lowerName = categoryName.toLowerCase();
        if (lowerName.includes("home")) return 1;
        if (lowerName.includes("construction")) return 2;
        if (lowerName.includes("marketplace")) return 3;
        return index + 1; // Fallback to original index for other categories
      };

      return {
        name: icon.name,
        icon: icon.icon_url || getFallbackIcon(icon.name),
        categoryId: getCategoryId(icon.name),
      };
    })
    // Filter out Home Service from the list
    .filter((category) => !category.name.toLowerCase().includes("home"))
    .sort((a, b) => {
      // Define the desired order: Construction Service first, Marketplace second
      const getOrder = (name: string) => {
        const lowerName = name.toLowerCase();
        // if (lowerName.includes("home")) return 1; // Commented out - Home Service removed
        if (lowerName.includes("construction")) return 1;
        if (lowerName.includes("marketplace")) return 2;
        return 3; // Any other categories go last
      };

      return getOrder(a.name) - getOrder(b.name);
    });

  return (
    <section className={`w-full py-8 ${backgroundColor} ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Image */}
          <div className="lg:pr-10">
            <div className="relative w-full aspect-square">
              {/* Image for small screens */}
              <Image
                src="/images/others/other-we-provide-down.png"
                alt="Other services we provide"
                width={500}
                height={500}
                className="rounded-2xl w-full h-full object-cover lg:hidden"
              />
              {/* Image for large screens */}
              <Image
                src="/images/others/other-we-provide.png"
                alt="Other services we provide"
                width={500}
                height={500}
                className="rounded-2xl w-full h-full object-cover hidden lg:block"
              />
            </div>
          </div>

          {/* Right Column - Categories */}
          <div className="border border-gray-200 rounded-2xl p-6">
            {/* Section Header */}
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                Other services we provide
              </h2>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.categoryId} {...category} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
