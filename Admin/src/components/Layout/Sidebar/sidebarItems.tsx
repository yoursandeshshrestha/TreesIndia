import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  CreditCard,
  Calendar,
  FileText,
  MapPin,
  Tag,
  Layers,
  Wallet,
  BarChart3,
  MessageSquare,
  Shield,
  FolderTree,
  Package,
  Home,
  Briefcase,
  TrendingUp,
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
    id: "real-estate",
    label: "Real Estate",
    icon: <Home size={16} />,
    children: [
      {
        id: "properties",
        label: "All Properties",
        icon: <Building2 size={16} />,
        path: "/dashboard/properties",
      },
      {
        id: "pending-properties",
        label: "Pending Approval",
        icon: <FileText size={16} />,
        path: "/dashboard/properties/pending",
      },
      {
        id: "locations",
        label: "Locations",
        icon: <MapPin size={16} />,
        path: "/dashboard/locations",
      },
    ],
  },
  {
    id: "bookings",
    label: "Bookings & Inquiries",
    icon: <Briefcase size={16} />,
    children: [
      {
        id: "all-bookings",
        label: "All Bookings",
        icon: <Calendar size={16} />,
        path: "/dashboard/bookings",
      },
      {
        id: "booking-stats",
        label: "Booking Statistics",
        icon: <TrendingUp size={16} />,
        path: "/dashboard/bookings/stats",
      },
      {
        id: "worker-inquiries",
        label: "Worker Inquiries",
        icon: <MessageSquare size={16} />,
        path: "/dashboard/worker-inquiries",
      },
    ],
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: <CreditCard size={16} />,
    children: [
      {
        id: "subscription-plans",
        label: "Subscription Plans",
        icon: <CreditCard size={16} />,
        path: "/dashboard/subscription-plans",
      },
      {
        id: "user-subscriptions",
        label: "User Subscriptions",
        icon: <Users size={16} />,
        path: "/dashboard/user-subscriptions",
      },
    ],
  },
  {
    id: "wallet",
    label: "Finance & Payments",
    icon: <Wallet size={16} />,
    children: [
      {
        id: "wallet-transactions",
        label: "Wallet Transactions",
        icon: <TrendingUp size={16} />,
        path: "/dashboard/wallet-transactions",
      },
      {
        id: "razorpay",
        label: "Payment Management",
        icon: <CreditCard size={16} />,
        path: "/dashboard/payments",
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
    id: "system",
    label: "System",
    icon: <Settings size={16} />,
    children: [
      {
        id: "analytics",
        label: "Analytics",
        icon: <BarChart3 size={16} />,
        path: "/dashboard/analytics",
      },
    ],
  },
];
