import React, { useState, useEffect } from "react";
import { X, Search, Users, Check } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import { api } from "@/lib/api-client";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface UserSelectorProps {
  onClose: () => void;
  onSelect: (userIds: number[]) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ onClose, onSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.phone && user.phone.includes(searchTerm))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "1000", // Get more users for selection
      });
      const response = await api.get(`/admin/users?${params}`);
      const fetchedUsers: User[] = [];

      // Handle different response structures
      interface ApiUser {
        ID?: number;
        id?: number;
        name?: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        phone_number?: string;
        avatar?: string;
        profile_picture?: string;
      }

      let usersArray: ApiUser[] = [];

      // The API returns: { data: { users: [...], pagination: {...} } }
      if (response && response.data) {
        // Check if response.data has a users property (paginated response)
        if (response.data.users && Array.isArray(response.data.users)) {
          usersArray = response.data.users;
        }
        // Check if response.data is directly an array (fallback)
        else if (Array.isArray(response.data)) {
          usersArray = response.data;
        }
      }

      usersArray.forEach((user: ApiUser) => {
        const userId = user.ID ?? user.id;
        // Only add users with a valid ID
        if (userId !== undefined) {
          fetchedUsers.push({
            id: userId,
            name:
              user.name ||
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              "Unknown",
            email: user.email || "",
            phone: user.phone || user.phone_number || "",
            avatar: user.avatar || user.profile_picture || undefined,
          });
        }
      });

      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((user) => user.id)));
    }
  };

  const handleConfirm = () => {
    onSelect(Array.from(selectedUsers));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99] p-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full flex flex-col max-h-[95vh] overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between p-6 py-4 border-b rounded-t-lg border-gray-200 bg-white sticky top-0 z-floating">
          <h2 className="text-xl font-semibold text-gray-900">Select Users</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0 overflow-visible">
          {/* Search */}
          <div>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email, or phone..."
              leftIcon={<Search size={16} />}
              className="h-10 bg-white"
            />
          </div>

          {/* User List */}
          <div>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Select All */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.size === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">
                    Select All ({filteredUsers.length} users)
                  </span>
                </div>

                {/* Users */}
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div className="flex items-center gap-3 flex-1">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {getInitials(user.name)}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {user.name}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-xs text-gray-400">{user.phone}</p>
                        )}
                      </div>
                    </div>

                    {selectedUsers.has(user.id) && (
                      <Check className="text-blue-600" size={20} />
                    )}
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="text-gray-400 mx-auto mb-2" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No users found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No users available"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t rounded-b-lg border-gray-200 bg-white">
          <div className="text-sm text-gray-600 mr-auto">
            {selectedUsers.size > 0 ? (
              <span className="text-blue-600 font-medium">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? "s" : ""}{" "}
                selected
              </span>
            ) : (
              "No users selected"
            )}
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleConfirm}
            disabled={selectedUsers.size === 0}
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserSelector;
