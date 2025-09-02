import {
  LayoutDashboard,
  Users,
  Layers,
  Package,
  Settings,
  FileText,
  Shield,
  Calendar,
  Image,
  Bell,
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
    id: "booking-management",
    label: "Booking Management",
    icon: <Calendar size={16} />,
    children: [
      {
        id: "booking-overview",
        label: "Booking Overview",
        path: "/dashboard/bookings/overview",
      },
      {
        id: "all-bookings",
        label: "All Bookings",
        path: "/dashboard/bookings/all",
      },
      {
        id: "fixed-price-bookings",
        label: "Fixed Price Bookings",
        path: "/dashboard/bookings/fixed-price",
      },
      {
        id: "inquiry-price-bookings",
        label: "Inquiry Price Bookings",
        path: "/dashboard/bookings/inquiry-price",
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
  {
    id: "banners",
    label: "Banner Management",
    icon: <Image size={16} />,
    path: "/dashboard/banners",
  },
  {
    id: "notifications",
    label: "Notification Management",
    icon: <Bell size={16} />,
    path: "/dashboard/notifications",
  },
  {
    id: "website-management",
    label: "Website Management",
    icon: <Settings size={16} />,
    path: "/dashboard/website-management",
  },
];
