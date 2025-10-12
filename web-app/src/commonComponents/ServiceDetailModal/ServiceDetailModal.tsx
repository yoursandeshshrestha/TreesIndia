"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar } from "lucide-react";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeServiceDetailModal } from "@/store/slices/serviceDetailModalSlice";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { openAuthModal } from "@/store/slices/authModalSlice";

export default function ServiceDetailModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isOpen, service } = useAppSelector(
    (state) => state.serviceDetailModal
  );

  const handleClose = () => {
    dispatch(closeServiceDetailModal());
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal({ redirectTo: `/services/${service?.id}/book` }));
      return;
    }
    router.push(`/services/${service?.id}/book`);
    handleClose();
  };

  const formatPrice = (price: number | null, priceType: string) => {
    if (priceType === "inquiry") {
      return "Inquiry Based";
    }
    if (price === null) {
      return "Price on request";
    }
    return `₹${price.toLocaleString()}`;
  };

  const formatPriceType = (priceType: string) => {
    return priceType === "fixed" ? "Fixed Price" : "Inquiry Based";
  };

  const getDefaultImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4NS4wNDcgMTUwIDE3MyAxMzcuOTUzIDE3MyAxMjNDMTczIDEwOC4wNDcgMTg1LjA0NyA5NiAyMDAgOTZDMjE0Ljk1MyA5NiAyMjcgMTA4LjA0NyAyMjcgMTIzQzIyNyAxMzcuOTUzIDIxNC45NTMgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yMDAgMTgwQzE2NS42NDkgMTgwIDEzNyAxNjUuNjQ5IDEzNyAxNDdDMTM3IDEyOC4zNTEgMTY1LjY0OSAxMTQgMjAwIDExNEMyMzQuMzUxIDExNCAyNjMgMTI4LjM1MSAyNjMgMTQ3QzI2MyAxNjUuNjQ5IDIzNC4zNTEgMTgwIDIwMCAxODBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
  };

  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-2 sm:p-4 md:p-6"
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
              className="bg-white rounded-2xl w-full min-w-[300px] max-w-none shadow-xl max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] flex flex-col"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Service Image */}
              <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-t-2xl overflow-hidden flex-shrink-0">
                <Image
                  src={
                    service.images && service.images.length > 0
                      ? service.images[0]
                      : getDefaultImage()
                  }
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes("data:image/svg+xml")) {
                      target.src = getDefaultImage();
                    }
                  }}
                />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-0">
                {/* Header */}
                <div className="mb-4">
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-[#00a871] font-medium">
                        {formatPriceType(service.price_type)}
                      </span>
                    </div>
                    {service.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-lg sm:text-xl font-bold text-[#00a871]">
                      {formatPrice(service.price, service.price_type)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {service.description && (
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      About this service
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {service.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Fixed Footer */}
              <div className="flex-shrink-0 p-4 sm:p-6 pt-4 border-t border-gray-200 bg-white rounded-b-2xl">
                <button
                  onClick={handleBookNow}
                  className="w-full bg-[#00a871] hover:bg-[#00a871]/90 text-white font-medium py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Calendar className="w-4 h-4" />
                  Book Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
