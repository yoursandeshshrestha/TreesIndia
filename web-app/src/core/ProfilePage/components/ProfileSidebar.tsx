"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ConfirmModal } from "@/commonComponents/ConfirmModal";
import {
  User,
  Wallet,
  Calendar,
  CreditCard,
  Settings,
  MapPin,
  Info,
  LogOut,
  Briefcase,
  Home,
  Building2,
} from "lucide-react";

interface ProfileSidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface ProfileSidebarProps {
  onCloseMobileSidebar?: () => void;
}

export function ProfileSidebar({ onCloseMobileSidebar }: ProfileSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { userProfile } = useProfile();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Create sidebar items based on user type
  const getProfileSidebarItems = (): ProfileSidebarItem[] => {
    const baseItems = [
      {
        id: "profile",
        label: "Profile",
        icon: <User className="w-5 h-5" />,
        path: "/profile",
      },
      {
        id: "wallet",
        label: "Wallet",
        icon: <Wallet className="w-5 h-5" />,
        path: "/profile/wallet",
      },
      {
        id: "address",
        label: "Manage Address",
        icon: <MapPin className="w-5 h-5" />,
        path: "/profile/address",
      },
      {
        id: "my-properties",
        label: "My Properties",
        icon: <Home className="w-5 h-5" />,
        path: "/profile/my-properties",
      },
    ];

    // Only add "My Vendor Profile" if user has active subscription
    if (userProfile?.subscription?.status === "active") {
      baseItems.push({
        id: "my-vendors",
        label: "My Vendor Profile",
        icon: <Building2 className="w-5 h-5" />,
        path: "/profile/my-vendors",
      });
    }

    // Add work/bookings item based on user type
    const workOrBookingsItem =
      user?.user_type === "worker"
        ? {
            id: "work",
            label: "My Work",
            icon: <Briefcase className="w-5 h-5" />,
            path: "/profile/my-work",
          }
        : {
            id: "bookings",
            label: "My Bookings",
            icon: <Calendar className="w-5 h-5" />,
            path: "/profile/my-bookings",
          };

    const remainingItems = [
      {
        id: "subscription",
        label: "My Subscription",
        icon: <CreditCard className="w-5 h-5" />,
        path: "/profile/subscription",
      },
      {
        id: "settings",
        label: "Settings",
        icon: <Settings className="w-5 h-5" />,
        path: "/profile/settings",
      },
      {
        id: "about",
        label: "About TreesIndia",
        icon: <Info className="w-5 h-5" />,
        path: "/profile/about",
      },
    ];

    return [...baseItems, workOrBookingsItem, ...remainingItems];
  };

  const profileSidebarItems = getProfileSidebarItems();

  const handleNavigation = (path: string) => {
    router.push(path);
    // Close mobile sidebar after navigation
    if (onCloseMobileSidebar) {
      onCloseMobileSidebar();
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="w-full lg:w-80 bg-white border border-gray-200 rounded-lg p-4 lg:sticky lg:top-24 lg:h-fit">
        {/* Navigation Items */}
        <div className="space-y-2">
          {profileSidebarItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:tracking-wide"
                }`}
              >
                <div
                  className={`${isActive ? "text-green-600" : "text-gray-500"}`}
                >
                  {item.icon}
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </>
  );
}
