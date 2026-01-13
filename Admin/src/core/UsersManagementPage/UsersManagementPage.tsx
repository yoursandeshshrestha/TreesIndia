"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import Pagination from "@/components/Pagination/Pagination";
import { Loader, Users } from "lucide-react";
import { api } from "@/lib/api-client";

// Components
import UserHeader from "@/core/UsersManagementPage/components/UserHeader";
import UserFilters from "@/core/UsersManagementPage/components/UserFilters";
import UserTable from "@/core/UsersManagementPage/components/UserTable";
import UserTabs, { UserTabType } from "@/core/UsersManagementPage/components/UserTabs";
import CreateEditUserModal from "@/core/UsersManagementPage/components/CreateEditUserModal";
import UserPreviewModal from "@/core/UsersManagementPage/components/UserPreviewModal";
import ManualWalletAdditionForm from "@/core/UsersManagementPage/components/ManualWalletAdditionForm";

// Types and interfaces
import {
  User,
  UserFilterState,
  UsersApiResponse,
  BackendApiResponse,
} from "@/types/user";

function UsersManagementPage() {
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Stats for tabs
  const [userStats, setUserStats] = useState({
    total: 0,
    workers: 0,
    brokers: 0,
    admins: 0,
    normal: 0,
  });

  const [selectionMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isWalletAdditionModalOpen, setIsWalletAdditionModalOpen] =
    useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<UserTabType>("all");

  // Filters
  const [filters, setFilters] = useState<UserFilterState>({
    search: "",
    user_type: "",
    is_active: "",
    has_active_subscription: "",
    date_from: "",
    date_to: "",
  });

  // Sync URL params with state on mount
  useEffect(() => {
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const user_type = searchParams.get("user_type");
    const is_active = searchParams.get("is_active");
    const has_active_subscription = searchParams.get("has_active_subscription");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");
    if (page) setCurrentPage(Number(page));
    if (limit) setItemsPerPage(Number(limit));
    if (search) setLocalSearch(search);
    if (user_type) setFilters((prev) => ({ ...prev, user_type }));
    if (is_active) setFilters((prev) => ({ ...prev, is_active }));
    if (has_active_subscription)
      setFilters((prev) => ({ ...prev, has_active_subscription }));
    if (date_from) setFilters((prev) => ({ ...prev, date_from }));
    if (date_to) setFilters((prev) => ({ ...prev, date_to }));

    loadUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  const loadUserStats = useCallback(async () => {
    try {
      // Fetch user stats from the backend endpoint
      const data = await api.get(`/admin/users/stats`);
      const statsData = (data as BackendApiResponse<{
        total: number;
        workers: number;
        brokers: number;
        admins: number;
        normal: number;
      }>).data;

      setUserStats({
        total: statsData?.total || 0,
        workers: statsData?.workers || 0,
        brokers: statsData?.brokers || 0,
        admins: statsData?.admins || 0,
        normal: statsData?.normal || 0,
      });
    } catch (err) {
      console.error("Failed to load user stats", err);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.user_type && { user_type: filters.user_type }),
        ...(filters.is_active && { is_active: filters.is_active }),

        ...(filters.has_active_subscription && {
          has_active_subscription: filters.has_active_subscription,
        }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      });

      const data = await api.get(`/admin/users?${params}`);
      const apiResponse = data as BackendApiResponse<UsersApiResponse>;
      const response = apiResponse.data;
      setUsers(response?.users || []);
      setTotalPages(response?.pagination?.total_pages || 1);
      setTotalUsers(response?.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to load users", err);
      toast.error("Error loading users");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  // Load stats on mount
  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  // Load users when filters or pagination changes
  useEffect(() => {
    loadUsers();
  }, [currentPage, itemsPerPage, filters, loadUsers]);

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      await api.post("/admin/users", userData);
      toast.success("User created successfully");
      setIsCreateModalOpen(false);
      loadUsers();
      loadUserStats(); // Refresh stats
    } catch (err) {
      console.error("Failed to create user", err);
      toast.error("Failed to create user");
    }
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;

    try {
      await api.put(`/admin/users/${selectedUser.ID}`, userData);
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      console.error("Failed to update user", err);
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (user: User) => {
    setIsDeletingUser(true);
    try {
      await api.delete(`/admin/users/${user.ID}`);
      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      loadUsers();
      loadUserStats(); // Refresh stats
    } catch (err) {
      console.error("Failed to delete user", err);
      // Extract error message from ApiError
      let errorMessage = "Failed to delete user";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (
        typeof err === "object" &&
        err !== null &&
        "message" in err
      ) {
        errorMessage = String(err.message);
      } else if (
        typeof err === "object" &&
        err !== null &&
        "data" in err
      ) {
        const data = err.data as { message?: string; error?: string };
        errorMessage = data?.message || data?.error || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleToggleActivation = async (user: User) => {
    try {
      await api.post(`/admin/users/${user.ID}/activate`);
      toast.success(
        `User ${user.is_active ? "deactivated" : "activated"} successfully`
      );
      loadUsers();
    } catch (err) {
      console.error("Failed to toggle user activation", err);
      toast.error("Failed to toggle user activation");
    }
  };

  const handleDeleteUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleWalletAddition = (user: User) => {
    setSelectedUser(user);
    setIsWalletAdditionModalOpen(true);
  };

  const handleWalletAdditionSuccess = () => {
    loadUsers(); // Refresh the user list to show updated wallet balance
  };

  const handleTabChange = (tab: UserTabType) => {
    setActiveTab(tab);
    // Update the user_type filter based on the active tab
    if (tab === "all") {
      setFilters((prev) => ({ ...prev, user_type: "" }));
    } else {
      setFilters((prev) => ({ ...prev, user_type: tab }));
    }
    setCurrentPage(1);
  };

  // Filter users based on current filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !filters.search ||
      user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.phone?.includes(filters.search);

    const matchesUserType =
      !filters.user_type || user.user_type === filters.user_type;
    const matchesActive =
      !filters.is_active ||
      (filters.is_active === "true" ? user.is_active : !user.is_active);

    const matchesSubscription =
      !filters.has_active_subscription ||
      (filters.has_active_subscription === "true"
        ? user.has_active_subscription
        : !user.has_active_subscription);

    return (
      matchesSearch && matchesUserType && matchesActive && matchesSubscription
    );
  });


  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <UserHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
        }}
        onRefresh={loadUsers}
        onCreateUser={() => setIsCreateModalOpen(true)}
      />

      <CreateEditUserModal
        title="Create User"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        mode="create"
      />

      <CreateEditUserModal
        title="Edit User"
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateUser}
        initialData={selectedUser}
        mode="edit"
      />

      <UserPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={() => selectedUser && handleDeleteUser(selectedUser)}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingUser}
      />

      <ManualWalletAdditionForm
        isOpen={isWalletAdditionModalOpen}
        onClose={() => {
          setIsWalletAdditionModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleWalletAdditionSuccess}
        selectedUser={
          selectedUser
            ? {
                id: selectedUser.ID,
                name: selectedUser.name,
                email: selectedUser.email,
                phone: selectedUser.phone,
                wallet_balance: selectedUser.wallet_balance,
              }
            : null
        }
      />

      <div className="mt-6">
        <UserTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          stats={userStats}
          isLoading={isLoading}
        />
      </div>

      <UserFilters
        search={localSearch}
        user_type={filters.user_type}
        is_active={filters.is_active}
        has_active_subscription={filters.has_active_subscription}
        onSearchChange={(value) => {
          setLocalSearch(value);
          setIsSearching(true);
        }}
        onUserTypeChange={(value) => {
          setFilters((prev) => ({ ...prev, user_type: value }));
          // Update active tab when user type filter changes
          if (value === "") setActiveTab("all");
          else if (value === "worker") setActiveTab("worker");
          else if (value === "broker") setActiveTab("broker");
          else if (value === "admin") setActiveTab("admin");
          else if (value === "normal") setActiveTab("normal");
          setCurrentPage(1);
        }}
        onIsActiveChange={(value) => {
          setFilters((prev) => ({ ...prev, is_active: value }));
          setCurrentPage(1);
        }}
        onHasActiveSubscriptionChange={(value) => {
          setFilters((prev) => ({ ...prev, has_active_subscription: value }));
          setCurrentPage(1);
        }}
        onClear={() => {
          setActiveTab("all");
          setFilters({
            search: "",
            user_type: "",
            is_active: "",
            has_active_subscription: "",
            date_from: "",
            date_to: "",
          });
          setLocalSearch("");
          setIsSearching(false);
        }}
        isSearching={isSearching}
      />

      <UserTable
        users={filteredUsers}
        totalUsers={totalUsers}
        selectionMode={selectionMode}
        selectedUsers={selectedUsers}
        onSelectionChange={(selected) =>
          setSelectedUsers(selected.map((user) => user.ID.toString()))
        }
        onRowClick={(user) => {
          setSelectedUser(user);
          setIsPreviewModalOpen(true);
        }}
        onEditUser={handleEditUser}
        onToggleActivation={handleToggleActivation}
        onDeleteUser={handleDeleteUserClick}
        onWalletAddition={handleWalletAddition}
      />

      {filteredUsers.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center h-[400px] w-full flex items-center justify-center">
          <div className="text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}

export default UsersManagementPage;
