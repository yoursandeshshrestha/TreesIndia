import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, Shield, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLogout } from "@/services/api/auth";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { useAppDispatch } from "@/app/store";
import { clearUser } from "@/app/store/slices";
import { performLogout } from "@/utils/authUtils";

interface ProfileDropdownProps {
  userName: string;
  userEmail: string;
  userInitials: string;
  userAvatar?: string;
}

const isBase64Image = (src: string): boolean => {
  return src.startsWith("data:image/");
};

const renderAvatar = (src: string, alt: string) => {
  if (isBase64Image(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-full bg-gray-300 flex items-center justify-center rounded-full">
                <span class="text-sm font-medium text-gray-700">${alt
                  .charAt(0)
                  .toUpperCase()}</span>
              </div>
            `;
          }
        }}
      />
    );
  }
  return (
    <Image
      width={32}
      height={32}
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `
            <div class="w-full h-full bg-gray-300 flex items-center justify-center rounded-full">
              <span class="text-sm font-medium text-gray-700">${alt
                .charAt(0)
                .toUpperCase()}</span>
              </div>
          `;
        }
      }}
    />
  );
};

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  userName,
  userEmail,
  userInitials,
  userAvatar,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const logoutMutation = useLogout();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (action: string) => {
    console.log("ProfileDropdown: handleItemClick called with action:", action);
    switch (action) {
      case "profile":
        console.log("ProfileDropdown: Navigating to profile");
        router.push("/dashboard/profile");
        break;
      case "security":
        console.log("ProfileDropdown: Navigating to security");
        router.push("/dashboard/profile/security");
        break;
      case "sign-out":
        console.log("ProfileDropdown: Showing logout modal");
        setShowLogoutModal(true);
        break;
      case "system-settings":
        console.log("ProfileDropdown: Navigating to admin configs");
        router.push("/dashboard/admin-configs");
        break;
      default:
        console.log("ProfileDropdown: Unknown action:", action);
        break;
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Clear user data from Redux store
      dispatch(clearUser());
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear user data from Redux store even if API call fails
      dispatch(clearUser());
    } finally {
      // Use comprehensive logout function to ensure all state is cleared
      performLogout();
    }
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Debug dropdown state
  useEffect(() => {
    if (isOpen) {
      console.log("ProfileDropdown: Dropdown is open");
    }
  }, [isOpen]);

  return (
    <>
      <div className="relative inline-block" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={handleToggleDropdown}
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-sm flex  items-center justify-center overflow-hidden">
            {userAvatar ? (
              renderAvatar(userAvatar, `${userName} avatar`)
            ) : (
              <span className="text-white text-sm font-medium">
                {userInitials}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-700 font-mono">
            {userEmail}
          </span>

          <ChevronDown size={16} className="text-gray-400" />
        </button>

        {/* Dropdown Menu */}
        {isOpen &&
          createPortal(
            <div
              className="fixed w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-dropdown"
              style={{
                top: "80px",
                right: "24px",
              }}
              onMouseDown={(e) => {
                console.log("ProfileDropdown: Dropdown container clicked");
                e.stopPropagation();
              }}
            >
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-200 font-mono">
                <div className="font-semibold text-gray-900">{userName}</div>
                <div className="text-sm text-gray-500">{userEmail}</div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onMouseDown={(e) => {
                    console.log("ProfileDropdown: Profile button clicked");
                    e.preventDefault();
                    e.stopPropagation();
                    handleItemClick("profile");
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <User size={16} className="mr-3 text-gray-500" />
                  Profile
                </button>
                <button
                  onMouseDown={(e) => {
                    console.log("ProfileDropdown: Security button clicked");
                    e.preventDefault();
                    e.stopPropagation();
                    handleItemClick("security");
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Shield size={16} className="mr-3 text-gray-500" />
                  Security
                </button>
                <button
                  onMouseDown={(e) => {
                    console.log(
                      "ProfileDropdown: System settings button clicked"
                    );
                    e.preventDefault();
                    e.stopPropagation();
                    handleItemClick("system-settings");
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Settings size={16} className="mr-3 text-gray-500" />
                  System Configurations
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Sign Out */}
              <div className="py-1">
                <button
                  onMouseDown={(e) => {
                    console.log("ProfileDropdown: Sign out button clicked");
                    e.preventDefault();
                    e.stopPropagation();
                    handleItemClick("sign-out");
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <LogOut size={16} className="mr-3 text-gray-500" />
                  Sign out
                </button>
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to sign out? You will need to sign in again to access your account."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        isLoading={logoutMutation.isPending}
      />
    </>
  );
};

export default ProfileDropdown;
