"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import {
  X,
  Loader2,
  Home,
  Wrench,
  Sparkles,
  Scissors,
  Palette,
  Bug,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeSubcategoriesModal } from "@/store/slices/subcategoriesModalSlice";
import { useSubcategories } from "@/hooks/useSubcategories";
import { useRouter } from "next/navigation";
import { Subcategory } from "@/types/api";

// Icon mapping for different subcategories
const getSubcategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes("plumbing") ||
    lowerName.includes("electrical") ||
    lowerName.includes("carpentry")
  ) {
    return <Wrench className="w-8 h-8 text-blue-600" />;
  }
  if (lowerName.includes("cleaning") || lowerName.includes("maid")) {
    return <Sparkles className="w-8 h-8 text-green-600" />;
  }
  if (
    lowerName.includes("salon") ||
    lowerName.includes("spa") ||
    lowerName.includes("hair")
  ) {
    return <Scissors className="w-8 h-8 text-pink-600" />;
  }
  if (lowerName.includes("painting") || lowerName.includes("interior")) {
    return <Palette className="w-8 h-8 text-purple-600" />;
  }
  if (lowerName.includes("pest") || lowerName.includes("control")) {
    return <Bug className="w-8 h-8 text-orange-600" />;
  }

  // Default icon
  return <Home className="w-8 h-8 text-gray-600" />;
};

// Subcategory Card Component - Matching hero section style
const SubcategoryCard = ({
  subcategory,
  onClick,
}: {
  subcategory: Subcategory;
  onClick: () => void;
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="bg-gray-100 rounded-xl p-3 px-6 sm:p-4 sm:px-12 mb-3 hover:bg-gray-200 transition-colors">
        {subcategory.image && !imageError ? (
          <Image
            src={subcategory.image}
            alt={subcategory.name}
            width={50}
            height={50}
            className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] object-contain mx-auto"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] flex items-center justify-center mx-auto">
            {getSubcategoryIcon(subcategory.name)}
          </div>
        )}
      </div>
      <p className="text-gray-700 text-xs sm:text-sm font-normal text-center leading-tight">
        {subcategory.name}
      </p>
      <div className="w-0 group-hover:w-6 sm:group-hover:w-8 h-0.5 bg-[#00a871] mx-auto mt-2 transition-all duration-300"></div>
    </div>
  );
};

export default function SubcategoriesModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isOpen, categoryId, categoryName } = useAppSelector(
    (state) => state.subcategoriesModal
  );

  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useSubcategories({
    categoryId: categoryId || 0,
    enabled: isOpen && categoryId !== null,
  });

  // Since API always returns an array, we can simplify this
  const subcategories = response?.data || [];

  const handleClose = () => {
    dispatch(closeSubcategoriesModal());
  };

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    // Navigate to services page with category and subcategory parameters
    const params = new URLSearchParams();
    if (categoryId) {
      params.set("category", categoryId.toString());
    }
    params.set("subcategory", subcategory.id.toString());

    // Close the modal first
    handleClose();

    // Navigate to services page
    router.push(`/services?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-4 sm:p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className="relative"
          >
            {/* Close Button - Positioned on top of the modal */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              onClick={handleClose}
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-black" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-h-[80vh] w-full min-w-[300px] max-w-none flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 text-left">
                  {categoryName}
                </h2>
              </div>

              {/* Content - Matching hero section categories container */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
                    <p className="text-gray-600">Loading subcategories...</p>
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-red-600 text-center mb-4">
                      Failed to load subcategories
                    </p>
                    <p className="text-gray-500 text-xs text-center mb-4">
                      Error: {error?.message || "Unknown error"}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Try again
                    </button>
                  </div>
                ) : subcategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-600 text-center">
                      No subcategories available
                    </p>
                    <p className="text-gray-500 text-xs text-center mt-2">
                      Category ID: {categoryId}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6 pb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {subcategories.map((subcategory) => (
                        <SubcategoryCard
                          key={subcategory.id}
                          subcategory={subcategory}
                          onClick={() => handleSubcategoryClick(subcategory)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
