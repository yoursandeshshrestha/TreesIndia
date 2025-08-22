import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Layers,
  Shield,
  Package,
} from "lucide-react";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  isGroup?: boolean;
}

export const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    path: "/dashboard",
  },
  {
    id: "user-management",
    label: "User Management",
    icon: <Users size={16} />,
    children: [
      {
        id: "users",
        label: "All Users",
        icon: <Users size={16} />,
        path: "/dashboard/users-management",
      },
      {
        id: "role-applications",
        label: "Role Applications",
        icon: <FileText size={16} />,
        path: "/dashboard/role-applications",
      },
      {
        id: "workers",
        label: "Workers",
        icon: <Users size={16} />,
        path: "/dashboard/workers",
      },
      {
        id: "brokers",
        label: "Brokers",
        icon: <Shield size={16} />,
        path: "/dashboard/brokers",
      },
    ],
  },
  {
    id: "categories",
    label: "Category Management",
    icon: <Layers size={16} />,
    children: [
      {
        id: "categories",
        label: "Categories",
        path: "/dashboard/categories",
      },
      {
        id: "subcategories",
        label: "Subcategories",
        path: "/dashboard/subcategories",
      },
    ],
  },
  {
    id: "services",
    label: "Service Management",
    icon: <Package size={16} />,
    children: [
      {
        id: "list-services",
        label: "List Services",
        path: "/dashboard/services",
      },
      {
        id: "create-service",
        label: "Create New Service",
        path: "/dashboard/services/create-service",
      },
    ],
  },
  {
    id: "admin-configs",
    label: "System Configuration",
    icon: <Settings size={16} />,
    path: "/dashboard/admin-configs",
  },
];
