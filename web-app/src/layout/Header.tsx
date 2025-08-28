"use client";

import Image from "next/image";
import { Header as HeaderType } from "@/types/treesindia";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { useLocation } from "@/hooks/useLocationRedux";
import { useAppDispatch } from "@/store/hooks";
import { openLocationModal } from "@/store/slices/locationModalSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  data: HeaderType;
  className?: string;
}

export default function Header({ data, className = "" }: HeaderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { location } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLocationClick = () => {
    dispatch(openLocationModal());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to services page with search query
      const params = new URLSearchParams();
      params.set("search", searchQuery.trim());
      router.push(`/services?${params.toString()}`);
    }
  };

  return (
    <header className={`h-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo/treesindia-logo.png"
              alt="TreesIndia Logo"
              width={100}
              height={100}
              className="w-40 h-10"
            />
          </Link>

          {/* Search Section */}
          <div className="flex items-center space-x-4 flex-1 max-w-lg mx-8">
            {/* Location Dropdown */}
            <div className="relative">
              <button
                onClick={handleLocationClick}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors h-12 min-w-[160px]"
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
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <input
                  type="text"
                  placeholder="Search for services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 px-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a871]/20 focus:bg-white transition-all h-12"
                />
              </div>
            </form>
          </div>

          {/* Contact Us Button and User Menu */}
          <div className="flex items-center space-x-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
