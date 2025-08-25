"use client";

import Image from "next/image";
import { Header as HeaderType } from "@/types/treesindia";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { useAppDispatch } from "@/store/hooks";
import { openLocationModal } from "@/store/slices/locationModalSlice";

interface HeaderProps {
  data: HeaderType;
  className?: string;
}

export default function Header({ data, className = "" }: HeaderProps) {
  const dispatch = useAppDispatch();
  const { location } = useLocation();

  const handleLocationClick = () => {
    dispatch(openLocationModal());
  };

  return (
    <header className={`h-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image
              src={data.logo.image}
              alt={`${data.logo.text} Logo`}
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-gray-900 text-xl font-bold">
              {data.logo.text}
            </span>
          </div>

          {/* Search Section */}
          <div className="flex items-center space-x-4 flex-1 max-w-md mx-8">
            {/* Location Dropdown */}
            <div className="relative">
              <button
                onClick={handleLocationClick}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors h-12"
              >
                <MapPin className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-sm font-medium">
                    {location ? location.city : "Set Location"}
                  </div>
                  {location && (
                    <div className="text-xs text-gray-500">
                      {location.state}, {location.country}
                    </div>
                  )}
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 px-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a871]/20 focus:bg-white transition-all h-12"
                />
              </div>
            </div>
          </div>

          {/* Contact Us Button */}
          <div className="flex items-center space-x-4">
            <button className="bg-[#055c3a] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00865a] transition-colors whitespace-nowrap h-12 flex items-center">
              {data.cta.label}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
