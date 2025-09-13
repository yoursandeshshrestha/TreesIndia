"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeMarketplaceModal } from "@/store/slices/marketplaceModalSlice";
import { useRouter } from "next/navigation";

interface MarketplaceOption {
  id: string;
  name: string;
  icon: string;
  route: string;
}

const marketplaceOptions: MarketplaceOption[] = [
  {
    id: "rental-properties",
    name: "Rental & Properties",
    icon: "/images/main-icons/rental_properties.png",
    route: "/marketplace/rental-properties",
  },
  {
    id: "projects",
    name: "Projects",
    icon: "/images/main-icons/projects.png",
    route: "/marketplace/projects",
  },
  {
    id: "vendors",
    name: "Vendors",
    icon: "/images/main-icons/vendors.png",
    route: "/marketplace/vendors",
  },
  {
    id: "workforce",
    name: "Workers",
    icon: "/images/main-icons/workforce.png",
    route: "/marketplace/workforce",
  },
];

const MarketplaceOptionCard = ({ option }: { option: MarketplaceOption }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    // Close the modal first
    dispatch(closeMarketplaceModal());
    // Navigate to the marketplace option
    router.push(option.route);
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="bg-gray-100 rounded-xl p-4 px-12 mb-3 hover:bg-gray-200 transition-colors">
        {!imageError ? (
          <Image
            src={option.icon}
            alt={option.name}
            width={50}
            height={50}
            className="w-[50px] h-[50px] object-contain mx-auto"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-[50px] h-[50px] flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-gray-400 rounded"></div>
          </div>
        )}
      </div>
      <p className="text-gray-700 text-sm font-normal text-center">
        {option.name}
      </p>
      <div className="w-0 group-hover:w-8 h-0.5 bg-[#00a871] mx-auto mt-2 transition-all duration-300"></div>
    </div>
  );
};

export default function MarketplaceModal() {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state) => state.marketplaceModal);

  const handleClose = () => {
    dispatch(closeMarketplaceModal());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-4"
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
              className="bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 ">
                <h2 className="text-2xl font-semibold text-gray-900 text-left">
                  Marketplace
                </h2>
              </div>

              {/* Content - Matching hero section categories container */}
              <div>
                <div className=" p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {marketplaceOptions.map((option) => (
                      <MarketplaceOptionCard key={option.id} option={option} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
