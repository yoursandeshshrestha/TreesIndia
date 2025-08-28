import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { Service } from "@/types/api";
import { Clock } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  showDivider: boolean;
}

export function ServiceCard({ service, showDivider }: ServiceCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();

  // Format price type for display
  const formatPriceType = (priceType: string) => {
    return priceType === "fixed" ? "Fixed Price" : "Inquiry Based";
  };

  // Format price display
  const formatPrice = (price: number | null, priceType: string) => {
    if (priceType === "inquiry") {
      return "Inquiry Based";
    }
    if (price === null) {
      return "Contact for price";
    }
    return `₹${price.toLocaleString()}`;
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      // Open auth modal for login with redirect to booking page
      dispatch(openAuthModal({ redirectTo: `/services/${service.id}/book` }));
      return;
    }
    router.push(`/services/${service.id}/book`);
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-black">{service.name}</h3>
          </div>

          {/* Price Type and Duration */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#00a871] text-sm font-medium">
              {formatPriceType(service.price_type)}
            </span>
            {service.duration && (
              <div className="flex items-center text-gray-500 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {service.duration}
              </div>
            )}
          </div>

          <p className="text-black font-medium mb-3">
            {formatPrice(service.price, service.price_type)}
          </p>
          {service.description && (
            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
          )}
          <a href="#" className="text-[#00a871] underline text-sm">
            View details
          </a>
        </div>
        <div className="ml-6 text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center transition-all duration-300 hover:shadow-lg">
            {service.images && service.images.length > 0 ? (
              <Image
                src={service.images[0]}
                alt={service.name}
                width={128}
                height={128}
                className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <span className="text-gray-400 text-lg font-medium">
                {service.name.charAt(0)}
              </span>
            )}
          </div>
          <button
            onClick={handleBookNow}
            className="w-32 border border-[#00a871] text-[#00a871] bg-white px-6 py-2 rounded-lg text-sm font-medium mb-1 hover:bg-[#00a871] hover:text-white transition-all duration-300 ease-in-out transform cursor-pointer"
          >
            Book Now
          </button>
        </div>
      </div>
      {showDivider && <div className="border-t border-gray-200 mt-6"></div>}
    </div>
  );
}
