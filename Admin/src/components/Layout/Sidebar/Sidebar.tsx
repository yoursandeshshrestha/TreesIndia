import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, Search, X } from "lucide-react";
import { sidebarItems, type SidebarItem } from "./sidebarItems";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/app/store";
import { setSidebarOpen } from "@/app/store";
import ProfileCard from "./ProfileCard";
import { useGlobalWebSocket } from "@/components/GlobalWebSocketProvider/GlobalWebSocketProvider";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set([]));
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Get global WebSocket state and unread count
  const { totalUnreadCount } = useGlobalWebSocket();

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

  // Close sidebar on mobile when clicking a navigation item
  const handleMobileNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      dispatch(setSidebarOpen({ isOpen: false }));
    }
  };

  // Load expanded state from localStorage
  useEffect(() => {
    const savedExpanded = localStorage.getItem("sidebar-expanded-items");
    if (savedExpanded) {
      setExpandedItems(new Set(JSON.parse(savedExpanded)));
    }
  }, []);

  // Auto-expand parent section when child route is active
  useEffect(() => {
    const currentPath = pathname;

    // Find which parent section contains the current route
    for (const item of sidebarItems) {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => {
          if (child.path === currentPath) return true;
          // Check nested children
          if (child.children) {
            return child.children.some(
              (nestedChild) => nestedChild.path === currentPath
            );
          }
          return false;
        });
        if (hasActiveChild) {
          // Auto-expand the parent section
          setExpandedItems(new Set([item.id]));
          break;
        }
      }
    }
  }, [pathname]);

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "sidebar-expanded-items",
      JSON.stringify([...expandedItems])
    );
  }, [expandedItems]);

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      // If the item is already expanded, collapse it
      newExpanded.delete(itemId);
    } else {
      // If the item is collapsed, expand it and close all other groups
      // Clear all expanded items first (accordion behavior)
      newExpanded.clear();
      // Then add the clicked item
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigation = (path: string) => {
    handleMobileNavigation(path);
  };

  const isActiveRoute = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (item: SidebarItem) => {
    if (item.path && isActiveRoute(item.path)) return true;
    if (item.children) {
      return item.children.some((child) => {
        if (isActiveRoute(child.path)) return true;
        // Check nested children
        if (child.children) {
          return child.children.some((nestedChild) =>
            isActiveRoute(nestedChild.path)
          );
        }
        return false;
      });
    }
    return false;
  };

  // Filter items based on search
  const filteredItems = sidebarItems.filter((item) => {
    if (!searchTerm) return true;

    const matchesItem = item.label
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesChildren = item.children?.some((child) => {
      const matchesChild = child.label
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesNestedChildren = child.children?.some((nestedChild) =>
        nestedChild.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesChild || matchesNestedChildren;
    });

    return matchesItem || matchesChildren;
  });

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    item: SidebarItem,
    index: number
  ) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (item.children && item.children.length > 0) {
          toggleExpand(item.id);
        } else if (item.path) {
          handleNavigation(item.path);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(Math.min(index + 1, filteredItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(Math.max(index - 1, 0));
        break;
    }
  };

  const renderSidebarItem = (item: SidebarItem, index: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = isParentActive(item);
    const isGroup = item.isGroup;
    const isFocused = focusedIndex === index;

    return (
      <div key={item.id} className="group">
        {/* Main Item */}
        <div
          onClick={() => {
            if (hasChildren && !isGroup) {
              toggleExpand(item.id);
            } else if (item.path) {
              handleNavigation(item.path);
            }
            // Group items are just labels, no click action needed
          }}
          onKeyDown={(e) => handleKeyDown(e, item, index)}
          tabIndex={isGroup ? -1 : 0}
          className={`
            relative flex items-center w-full py-2
            transition-all duration-200 ease-out rounded-md
            ${isGroup ? "cursor-default px-0" : "cursor-pointer px-3"}
            ${!isActive && !isGroup && "hover:translate-x-1"}
            ${
              isGroup
                ? "text-gray-500 font-medium text-[19px] tracking-wide !pt-4 !pb-1 !py-0  uppercase text-left "
                : isActive
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }
            ${isFocused ? "ring-2 ring-blue-200" : ""}
          `}
        >
          {/* Icon */}
          <div
            className={`
              mr-3 transition-all duration-200 ease-out
              ${isActive && !isGroup ? "scale-105" : ""}
            `}
          >
            {item.icon}
          </div>

          {/* Label */}
          <span
            className={`${
              isGroup ? "text-[12px]" : "text-sm"
            } font-medium flex-1 transition-all duration-200 ${
              !isActive && !isGroup && "group-hover:tracking-wide"
            }`}
          >
            {item.label}
          </span>

          {/* Unread Count Badge for Chat */}
          {item.id === "chat" && totalUnreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
              {totalUnreadCount >= 100 ? "100+" : totalUnreadCount}
            </span>
          )}

          {/* Chevron */}
          {hasChildren && (
            <ChevronRight
              size={14}
              className={`
                transition-all duration-200 ease-out
                ${isExpanded ? "rotate-90" : ""}
                ${isActive && !isGroup ? "text-blue-600" : "text-gray-400"}
              `}
            />
          )}
        </div>

        {/* Children */}
        {hasChildren && (
          <div
            className={`
              overflow-hidden
              transition-all duration-300 ease-out
              ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
            `}
          >
            <div
              className={`relative ${
                isGroup ? "ml-6" : "ml-8"
              } mt-1 space-y-0.5`}
            >
              {/* Connection Line */}
              <div
                className={`
                  absolute left-[-8px] top-0 bottom-1 w-px bg-gray-200
                  transition-all duration-300 ease-out delay-200
                  ${
                    isExpanded
                      ? "opacity-100 scale-y-100"
                      : "opacity-0 scale-y-0"
                  }
                `}
              />

              {item.children?.map((child, childIndex) => {
                const hasNestedChildren =
                  child.children && child.children.length > 0;
                const isNestedExpanded = expandedItems.has(child.id);
                const isNestedActive = isParentActive(child);

                return (
                  <div key={child.id}>
                    {/* Child Item */}
                    <div
                      onClick={() => {
                        if (hasNestedChildren) {
                          toggleExpand(child.id);
                        } else if (child.path) {
                          handleNavigation(child.path);
                        }
                      }}
                      className={`
                        relative flex items-center px-3 py-2 cursor-pointer group/child
                        transition-all duration-200 ease-out rounded-md
                        ${
                          !isActiveRoute(child.path) &&
                          !hasNestedChildren &&
                          "hover:translate-x-1"
                        }
                        ${
                          isExpanded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-[-4px] opacity-0"
                        }
                        ${
                          isActiveRoute(child.path) || isNestedActive
                            ? "text-blue-600 bg-blue-50 border-blue-500"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }
                      `}
                      style={{
                        transitionDelay: isExpanded
                          ? `${100 + childIndex * 30}ms`
                          : "0ms",
                      }}
                    >
                      {/* Child Icon */}
                      <div className="mr-3">{child.icon}</div>

                      <span
                        className={`text-sm font-medium transition-all duration-200 ${
                          !isActiveRoute(child.path) &&
                          !isNestedActive &&
                          "group-hover/child:tracking-wide"
                        }`}
                      >
                        {child.label}
                      </span>

                      {/* Chevron for nested children */}
                      {hasNestedChildren && (
                        <ChevronRight
                          size={12}
                          className={`
                            ml-auto transition-all duration-200 ease-out
                            ${isNestedExpanded ? "rotate-90" : ""}
                            ${
                              isNestedActive ? "text-blue-600" : "text-gray-400"
                            }
                          `}
                        />
                      )}
                    </div>

                    {/* Nested Children */}
                    {hasNestedChildren && (
                      <div
                        className={`
                          overflow-hidden ml-4
                          transition-all duration-300 ease-out
                          ${
                            isNestedExpanded
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }
                        `}
                      >
                        <div className="relative mt-1 space-y-0.5">
                          {/* Connection Line for nested */}
                          <div
                            className={`
                              absolute left-[-8px] top-0 bottom-1 w-px bg-gray-200
                              transition-all duration-300 ease-out delay-200
                              ${
                                isNestedExpanded
                                  ? "opacity-100 scale-y-100"
                                  : "opacity-0 scale-y-0"
                              }
                            `}
                          />

                          {child.children?.map((nestedChild, nestedIndex) => (
                            <div
                              key={nestedChild.id}
                              onClick={() =>
                                nestedChild.path &&
                                handleNavigation(nestedChild.path)
                              }
                              className={`
                                relative flex items-center px-3 py-2 cursor-pointer group/nested
                                transition-all duration-200 ease-out rounded-md
                                ${
                                  !isActiveRoute(nestedChild.path) &&
                                  "hover:translate-x-1"
                                }
                                ${
                                  isNestedExpanded
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-[-4px] opacity-0"
                                }
                                ${
                                  isActiveRoute(nestedChild.path)
                                    ? "text-blue-600 bg-blue-50 border-blue-500"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }
                              `}
                              style={{
                                transitionDelay: isNestedExpanded
                                  ? `${150 + nestedIndex * 30}ms`
                                  : "0ms",
                              }}
                            >
                              {/* Nested Child Icon */}
                              <div className="mr-3">{nestedChild.icon}</div>

                              <span
                                className={`text-sm font-medium transition-all duration-200 ${
                                  !isActiveRoute(nestedChild.path) &&
                                  "group-hover/nested:tracking-wide"
                                }`}
                              >
                                {nestedChild.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={sidebarRef}
      className={`h-screen bg-white border-r border-black/10 flex flex-col transition-all duration-300 ${
        isMobile ? "w-80" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-3 border-b border-black/10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Admin
          </h1>
          <p className="text-sm text-gray-400 font-medium">TreesIndia</p>
        </div>

        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={() => dispatch(setSidebarOpen({ isOpen: false }))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        <div className="space-y-1">
          {filteredItems.map((item, index) => renderSidebarItem(item, index))}
        </div>
      </div>

      {/* Profile Card */}
      <ProfileCard />
    </div>
  );
};

export default Sidebar;
