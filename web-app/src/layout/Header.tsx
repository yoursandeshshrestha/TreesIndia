"use client";

import Image from "next/image";
import {
  Search,
  MapPin,
  ChevronDown,
  Menu,
  X,
  Home as HomeIcon,
} from "lucide-react";
import { useLocation } from "@/hooks/useLocationRedux";
import { useAppDispatch } from "@/store/hooks";
import { openLocationModal } from "@/store/slices/locationModalSlice";
import { openSearchModal } from "@/store/slices/searchModalSlice";
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { useConversationWebSocketService } from "@/hooks/useConversationWebSocketService";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const dispatch = useAppDispatch();
  const { location } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const showHomeIcon = pathname !== "/";

  // Global conversation WebSocket connection (for Messages button in header)
  useConversationWebSocketService();

  const handleLocationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(openLocationModal());
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(openSearchModal());
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Simple overflow hidden approach
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={`h-16 lg:h-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/logo/treesindia-logo.png"
              alt="TreesIndia Logo"
              width={100}
              height={100}
              className="w-28 h-7 sm:w-32 sm:h-8 lg:w-40 lg:h-10"
            />
          </Link>

          {/* Desktop Search Section */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-2xl mx-8">
            {/* Location Dropdown */}
            <div className="relative">
              <button
                onClick={handleLocationClick}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-200 transition-colors h-12 min-w-[140px]"
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="text-sm font-medium truncate">
                    {location ? location.city : "Set Location"}
                  </div>
                  {location && (
                    <div className="text-xs text-gray-500 truncate">
                      {location.state}, {location.country}
                    </div>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              </button>
            </div>

            {/* Search Input */}
            <div className="flex-1 relative">
              <button
                onClick={handleSearchClick}
                className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 px-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a871]/20 focus:bg-white transition-all h-12 text-left flex items-center"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <span className="text-gray-500">Search for services...</span>
              </button>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {showHomeIcon && (
              <Link
                href="/"
                aria-label="Go to home"
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
              </Link>
            )}
            <UserMenu />
          </div>

          {/* Mobile Search and Menu Buttons */}
          <div className="flex lg:hidden items-center space-x-2">
            {showHomeIcon && (
              <Link
                href="/"
                aria-label="Go to home"
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
              </Link>
            )}
            {/* Mobile Search Button */}
            <button
              onClick={handleSearchClick}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Location Button */}
            <button
              onClick={handleLocationClick}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MapPin className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={toggleMobileMenu}
          >
            <div
              className="fixed top-0 left-0 right-0 bottom-0 bg-white flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center">
                  <Image
                    src="/logo/treesindia-logo.png"
                    alt="TreesIndia Logo"
                    width={100}
                    height={100}
                    className="w-32 h-8"
                  />
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="px-4 py-6 space-y-6">
                  {/* Mobile User Menu */}
                  <div className="border-b border-gray-200 pb-6">
                    <UserMenu
                      isMobileMenuContext={true}
                      onMenuClose={() => setIsMobileMenuOpen(false)}
                    />
                  </div>

                  {/* Mobile Search Section */}
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-gray-900">
                      Quick Actions
                    </div>

                    {/* Mobile Location */}
                    <button
                      onClick={() => {
                        handleLocationClick({} as React.MouseEvent);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MapPin className="w-6 h-6 text-gray-600" />
                      <div className="text-left">
                        <div className="text-base font-medium text-gray-900">
                          {location ? location.city : "Set Location"}
                        </div>
                        {location && (
                          <div className="text-sm text-gray-500">
                            {location.state}, {location.country}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Mobile Search */}
                    <button
                      onClick={() => {
                        handleSearchClick({} as React.MouseEvent);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Search className="w-6 h-6 text-gray-600" />
                      <span className="text-base text-gray-900">
                        Search for services...
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
