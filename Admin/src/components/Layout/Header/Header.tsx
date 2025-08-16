"use client";

import React, { useState, useEffect } from "react";
import { Bell, ChevronDown, PanelLeft, PanelRight, Menu } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { useRouter } from "next/navigation";
import { toggleSidebar, selectIsSidebarOpen } from "@/app/store";
import type { HeaderProps } from "./Header.types";

const Header: React.FC<HeaderProps> = ({
  breadcrumbs = [{ label: "Dashboard" }],
  userName = "Sandesh Shrestha",
  userInitials = "SS",
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSidebarOpen = useAppSelector(selectIsSidebarOpen);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleBreadcrumbClick = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <header className="bg-white w-full border-b border-black/10 px-6 py-3 fixed top-0 z-10 overflow-x-hidden transition-all duration-300">
      <div
        className={`flex items-center flex-wrap justify-between ${
          isSidebarOpen && !isMobile ? "w-[calc(100%-256px)]" : "w-full"
        }`}
      >
        {/* Left Section - Breadcrumbs */}
        <div className="flex items-center space-x-2 ">
          {/* Menu/Sidebar toggle button */}
          <button
            onClick={handleSidebarToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobile ? (
              <Menu size={20} className="text-gray-600" />
            ) : isSidebarOpen ? (
              <PanelLeft size={20} className="text-gray-600" />
            ) : (
              <PanelRight size={20} className="text-gray-600" />
            )}
          </button>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-300">/</span>}
                <span
                  onClick={() => handleBreadcrumbClick(breadcrumb.href)}
                  className={`text-gray-500 cursor-pointer ${
                    index === breadcrumbs.length - 1
                      ? "text-gray-900"
                      : "hover:text-gray-900 hover:tracking-wider transition-all duration-200"
                  }`}
                >
                  {breadcrumb.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right Section - Search, Actions, Profile */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={18} className="text-gray-600" />
            {/* Notification dot */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userInitials}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {userName}
            </span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
