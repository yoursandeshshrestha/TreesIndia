"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  ChevronDown,
  PanelLeft,
  PanelRight,
  Menu,
  Search,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { useRouter } from "next/navigation";
import { toggleSidebar, selectIsSidebarOpen, open } from "@/app/store";
import { SearchButton } from "@/components/CommandPalette";
import type { HeaderProps } from "./Header.types";

const Header: React.FC<HeaderProps> = ({
  breadcrumbs = [{ label: "Dashboard" }],
  userName = "Amit Bishwakarma",
  userInitials = "AB",
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSidebarOpen = useAppSelector(selectIsSidebarOpen);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleSearchFocus = () => {
    // When search input is focused, open command palette with current query
    dispatch(open(searchQuery));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      searchInputRef.current?.blur();
      setSearchQuery("");
    } else if (e.key === "Enter") {
      dispatch(open(searchQuery));
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
          {/* Search Input */}
          <div className="relative hidden md:block">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onClick={handleSearchFocus}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-16 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100 cursor-pointer"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>
          </div>

          {/* Mobile Search Button */}
          <div className="md:hidden">
            <SearchButton onClick={() => dispatch(open())} />
          </div>

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
