"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, User, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { User as UserType } from "@/types/user";
import { getCurrentUser } from "@/utils/authUtils";

interface UserSearchDropdownProps {
  onUserSelect: (user: UserType) => void;
  placeholder?: string;
  disabled?: boolean;
}

const UserSearchDropdown: React.FC<UserSearchDropdownProps> = ({
  onUserSelect,
  placeholder = "Search users...",
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchUsers(searchTerm);
      } else if (searchTerm.trim().length === 0) {
        // When search is cleared, clear users but don't auto-open
        setUsers([]);
        setIsOpen(false);
      } else {
        setUsers([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close dropdown when clicking outside
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

  const loadInitialUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.get("/admin/users?limit=20");
      if (data.success && data.data) {
        const currentUser = getCurrentUser();
        const allUsers = (data.data as any).users || [];

        // Filter out current user from the list
        let filteredUsers = currentUser
          ? allUsers.filter((user: UserType) => user.ID !== currentUser.id)
          : allUsers;

        // Deduplicate users by ID to prevent duplicates
        const uniqueUsers = filteredUsers.filter(
          (user: UserType, index: number, self: UserType[]) =>
            index === self.findIndex((u: UserType) => u.ID === user.ID)
        );

        setUsers(uniqueUsers);
        // Don't auto-open, only open when user clicks on search input
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.get(
        `/admin/users?search=${encodeURIComponent(query)}&limit=20`
      );
      if (data.success && data.data) {
        const currentUser = getCurrentUser();
        const allUsers = (data.data as any).users || [];

        // Filter out current user from the search results
        let filteredUsers = currentUser
          ? allUsers.filter((user: UserType) => user.ID !== currentUser.id)
          : allUsers;

        // Deduplicate users by ID to prevent duplicates
        const uniqueUsers = filteredUsers.filter(
          (user: UserType, index: number, self: UserType[]) =>
            index === self.findIndex((u: UserType) => u.ID === user.ID)
        );

        setUsers(uniqueUsers);
        setIsOpen(true);
      } else {
        throw new Error(data.message || "Failed to search users");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error searching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputFocus = () => {
    // Load initial 20 users when clicking on search input and open dropdown
    if (users.length === 0 && searchTerm === "") {
      loadInitialUsers().then(() => {
        setIsOpen(true);
      });
    } else {
      setIsOpen(true);
    }
  };

  const handleUserSelect = (user: UserType) => {
    setSelectedUser(user);
    setSearchTerm(user.name);
    setIsOpen(false);
    onUserSelect(user);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedUser(null);
    setUsers([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "normal":
        return "bg-blue-500";
      case "worker":
        return "bg-green-500";
      case "broker":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          disabled={disabled}
          className={`w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 size={16} className="animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {error ? (
            <div className="p-3 text-center text-red-500 text-sm">{error}</div>
          ) : users.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              {searchTerm ? "No users found" : "Start typing to search users"}
            </div>
          ) : (
            <div className="py-1">
              {users.map((user) => (
                <div
                  key={user.ID}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full ${getUserTypeColor(
                          user.user_type
                        )} flex items-center justify-center text-white text-sm font-semibold`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        user.is_active ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.user_type === "normal"
                            ? "bg-blue-100 text-blue-800"
                            : user.user_type === "worker"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {user.user_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-xs text-gray-500 truncate">
                        {user.phone}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchDropdown;
