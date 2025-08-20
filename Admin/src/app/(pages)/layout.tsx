"use client";

import React from "react";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Layout/Sidebar/Sidebar";
import Header from "@/components/Layout/Header/Header";
import { generateBreadcrumbs } from "@/utils/breadcrumbUtils";
import { setSidebarOpen, selectIsSidebarOpen } from "@/app/store";
import AuthGuard from "@/components/AuthGuard";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector(selectIsSidebarOpen);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { label: string; href?: string }[]
  >([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setBreadcrumbs(generateBreadcrumbs(pathname));
  }, [pathname]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 1000;
      setIsMobile(isMobileView);

      // Auto-close sidebar on mobile, auto-open on desktop
      if (isMobileView) {
        dispatch(setSidebarOpen({ isOpen: false }));
      } else {
        dispatch(setSidebarOpen({ isOpen: true }));
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  return (
    <AuthGuard requireAdmin={true}>
      <div className="flex min-h-screen h-full bg-gray-50">
        {/* Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-20 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
        </div>

        {/* Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-10 transition-opacity duration-300"
            onClick={() => dispatch(setSidebarOpen({ isOpen: false }))}
          />
        )}

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen && !isMobile ? "ml-64" : "ml-0"
          }`}
        >
          <Header breadcrumbs={breadcrumbs} />
          <main className="p-24 px-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

export default Layout;
