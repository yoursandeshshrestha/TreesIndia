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
  formatUserType,
  formatDate,
  formatCurrency,
  getUserTypeIcon,
} from "@/utils/userUtils";
import { displayValue } from "@/utils/displayUtils";
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

const isBase64Image = (src: string): boolean => {
  return src.startsWith("data:image/");
};

const renderAvatar = (src: string, alt: string) => {
  if (isBase64Image(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-10 w-10 rounded-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
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
      className="h-10 w-10 rounded-full object-cover"
      src={src}
      width={40}
      height={40}
      alt={alt}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `
            <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
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
                      renderAvatar(row.avatar, displayValue(row.name, "User"))
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {row.name ? row.name.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium text-gray-900 truncate"
                      title={displayValue(row.name, "Name not provided")}
                    >
                      {displayValue(row.name, "Name not provided")}
                    </div>
                    <div className="flex flex-col items-start space-x-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">
                          {displayValue(row.email, "Email not provided")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>
                          {displayValue(row.phone, "Phone not provided")}
                        </span>
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
              className: "text-blue-700 bg-blue-100 hover:bg-blue-200",
              icon: <Eye size={14} />,
              disabled: () => selectionMode,
            },
            {
              label: "Edit User",
              onClick: (row: User) => onEditUser(row),
              className: "text-blue-700 bg-blue-100 hover:bg-blue-200",
              icon: <Edit2 size={14} />,
              disabled: () => selectionMode,
            },
            {
              label: (row: User) =>
                row.is_active ? "Deactivate User" : "Activate User",
              onClick: (row: User) => onToggleActivation(row),
              className: (row: User) =>
                row.is_active
                  ? "text-orange-700 bg-orange-100 hover:bg-orange-200"
                  : "text-green-700 bg-green-100 hover:bg-green-200",
              disabled: (row: User) =>
                selectionMode || row.user_type === "admin",
            },
            {
              label: (row: User) => `Delete`,
              onClick: (row: User) => onDeleteUser(row),
              className: "text-red-700 bg-red-100 hover:bg-red-200",
              icon: <Trash2 size={14} />,
              disabled: (row: User) =>
                selectionMode || row.user_type === "admin",
            },
          ]}
          onRowClick={onRowClick}
        />
      </div>
    </div>
  );
};

export default UserTable;
