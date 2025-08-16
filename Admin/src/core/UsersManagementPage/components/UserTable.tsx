import {
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Wallet,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import Table from "@/components/Table/Table";
import { User } from "@/types/user";
import {
  getUserTypeColor,
  getStatusColor,
  getRoleApplicationColor,
  formatUserType,
  formatRoleApplicationStatus,
  formatDate,
  formatCurrency,
  getUserTypeIcon,
} from "@/utils/userUtils";
import Image from "next/image";

interface UserTableProps {
  users: User[];
  selectionMode: boolean;
  selectedUsers: string[];
  onSelectionChange: (selectedRows: User[]) => void;
  onRowClick: (user: User) => void;
  onEditUser: (user: User) => void;
  onToggleActivation: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

const UserTable = ({
  users,
  selectionMode,
  selectedUsers,
  onSelectionChange,
  onRowClick,
  onEditUser,
  onToggleActivation,
  onDeleteUser,
}: UserTableProps) => {
  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => u.is_active === false).length,
    pendingApplications: users.filter(
      (u) => u.role_application_status === "pending"
    ).length,
    withSubscription: users.filter((u) => u.has_active_subscription).length,
    totalWalletBalance: users.reduce((sum, u) => sum + u.wallet_balance, 0),
  };

  return (
    <div className="mt-2">
      {/* Statistics Summary */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Inactive</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.inactive}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            Pending Review
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pendingApplications}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Subscribed</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.withSubscription}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Total Balance</div>
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.totalWalletBalance)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={[
            {
              header: "User Information",
              accessor: (row: User) => (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {row.avatar ? (
                      <Image
                        className="h-10 w-10 rounded-full object-cover"
                        src={row.avatar}
                        width={40}
                        height={40}
                        alt={row.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {row.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {row.name}
                    </div>
                    <div className="flex flex-col items-start space-x-2 text-xs text-gray-500">
                      {row.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{row.email}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{row.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: "User Type & Status",
              accessor: (row: User) => (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const IconComponent = getUserTypeIcon(row.user_type);
                      return (
                        <IconComponent className="h-4 w-4 text-gray-500" />
                      );
                    })()}
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserTypeColor(
                        row.user_type
                      )}`}
                    >
                      {formatUserType(row.user_type)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        row.is_active ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        row.is_active
                      )}`}
                    >
                      {row.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Wallet & Subscription",
              accessor: (row: User) => (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4 text-gray-500" />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(row.wallet_balance)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        row.has_active_subscription
                          ? "bg-green-400"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="text-xs text-gray-600">
                      {row.has_active_subscription
                        ? "Active Subscription"
                        : "No Subscription"}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Role Application",
              accessor: (row: User) => (
                <div className="space-y-1">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleApplicationColor(
                      row.role_application_status
                    )}`}
                  >
                    {formatRoleApplicationStatus(row.role_application_status)}
                  </span>
                  {row.role_application_status === "pending" && (
                    <div className="text-xs text-yellow-600 font-medium">
                      Requires Review
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: "Account Details",
              accessor: (row: User) => (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {formatDate(row.CreatedAt)}</span>
                  </div>
                  {row.last_login_at && (
                    <div className="text-xs text-gray-500">
                      Last login: {formatDate(row.last_login_at)}
                    </div>
                  )}
                  {row.gender && (
                    <div className="text-xs text-gray-500 capitalize">
                      {row.gender.replace("_", " ")}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
          data={users}
          onSelectionChange={onSelectionChange}
          keyField="ID"
          selectable={selectionMode}
          selectedRows={users.filter(
            (user) => user.ID && selectedUsers.includes(user.ID.toString())
          )}
          actions={[
            {
              label: () => "View Details",
              onClick: (row: User) => onRowClick(row),
              className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
              icon: <Eye size={16} />,
              disabled: () => selectionMode,
            },
            {
              label: "Edit User",
              onClick: (row: User) => onEditUser(row),
              className: "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
              icon: <Edit2 size={16} />,
              disabled: () => selectionMode,
            },
            {
              label: (row: User) =>
                row.is_active ? "Deactivate User" : "Activate User",
              onClick: (row: User) => onToggleActivation(row),
              className: (row: User) =>
                row.is_active
                  ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  : "text-green-600 hover:text-green-700 hover:bg-green-50",
              disabled: () => selectionMode,
            },
            {
              label: (row: User) => `Delete`,
              onClick: (row: User) => onDeleteUser(row),
              className: "text-red-600 hover:text-red-700 hover:bg-red-50",
              icon: <Trash2 size={16} />,
              disabled: () => selectionMode,
            },
          ]}
          onRowClick={onRowClick}
        />
      </div>
    </div>
  );
};

export default UserTable;
