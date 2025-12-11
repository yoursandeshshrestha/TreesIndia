import {
  LayoutDashboard,
  Users,
  Layers,
  Package,
  Settings,
  FileText,
  Shield,
  Calendar,
  Image as ImageIcon,
  CreditCard,
  Home,
  HardHat,
  Building,
  UserCheck,
  Truck,
  MessageCircle,
  BookOpen,
  MapPin,
  Bell,
} from "lucide-react";
import type { AdminRole } from "@/services/api/auth";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  isGroup?: boolean;
  allowedRoles?: AdminRole[]; // if undefined, visible to any admin; otherwise requires one of these roles (super_admin always allowed)
}

// Helper function to create section labels
export const createSectionLabel = (
  label: string,
  allowedRoles?: AdminRole[]
): SidebarItem => ({
  id: `${label.toLowerCase().replace(/\s+/g, "-")}-group`,
  label,
  isGroup: true,
  allowedRoles,
});

// Helper function to create menu items
export const createMenuItem = (
  id: string,
  label: string,
  path: string,
  icon?: React.ReactNode,
  allowedRoles?: AdminRole[]
): SidebarItem => ({
  id,
  label,
  path,
  icon,
  allowedRoles,
});

// Helper function to create menu items with children
export const createMenuWithChildren = (
  id: string,
  label: string,
  icon: React.ReactNode,
  children: SidebarItem[],
  allowedRoles?: AdminRole[]
): SidebarItem => ({
  id,
  label,
  icon,
  children,
  allowedRoles,
});

export const sidebarItems: SidebarItem[] = [
  // Dashboard
  createMenuItem(
    "dashboard",
    "Dashboard",
    "/dashboard",
    <LayoutDashboard size={16} />
  ),

  // User Management Section
  createMenuWithChildren(
    "user-management",
    "User Management",
    <Users size={16} />,
    [
      createMenuItem(
        "users",
        "All Users",
        "/dashboard/users-management",
        <Users size={16} />,
        ["super_admin"]
      ),
      createMenuItem(
        "role-applications",
        "Role Applications",
        "/dashboard/role-applications",
        <FileText size={16} />,
        ["super_admin"]
      ),
      createMenuItem(
        "workers",
        "Workers",
        "/dashboard/workers",
        <Users size={16} />,
        ["super_admin"]
      ),
      createMenuItem(
        "brokers",
        "Brokers",
        "/dashboard/brokers",
        <Shield size={16} />,
        ["super_admin"]
      ),
    ],
    ["super_admin"]
  ),

  // Booking Management Section
  createMenuWithChildren(
    "booking-management",
    "Booking Management",
    <Calendar size={16} />,
    [
      createMenuItem(
        "booking-overview",
        "Booking Overview",
        "/dashboard/bookings/overview",
        undefined,
        ["super_admin", "booking_manager", "support_agent"]
      ),
      createMenuItem(
        "all-bookings",
        "All Bookings",
        "/dashboard/bookings/all",
        undefined,
        ["super_admin", "booking_manager", "support_agent"]
      ),
      createMenuItem(
        "fixed-price-bookings",
        "Fixed Price Bookings",
        "/dashboard/bookings/fixed-price",
        undefined,
        ["super_admin", "booking_manager"]
      ),
      createMenuItem(
        "inquiry-price-bookings",
        "Inquiry Price Bookings",
        "/dashboard/bookings/inquiry-price",
        undefined,
        ["super_admin", "booking_manager"]
      ),
    ]
  ),

  // Services Section (content + vendor focused roles)
  createSectionLabel("Services", [
    "super_admin",
    "content_manager",
    "vendor_manager",
  ]),

  // Category Management Section
  createMenuWithChildren(
    "categories",
    "Category Management",
    <Layers size={16} />,
    [
      createMenuItem(
        "categories",
        "Categories",
        "/dashboard/categories",
        undefined,
        ["super_admin", "content_manager"]
      ),
      createMenuItem(
        "subcategories",
        "Subcategories",
        "/dashboard/subcategories",
        undefined,
        ["super_admin", "content_manager"]
      ),
    ]
  ),

  // Service Management Section
  createMenuWithChildren(
    "services",
    "Service Management",
    <Package size={16} />,
    [
      createMenuItem(
        "list-services",
        "List Services",
        "/dashboard/services",
        undefined,
        ["super_admin", "content_manager", "vendor_manager"]
      ),
      createMenuItem(
        "create-service",
        "Create New Service",
        "/dashboard/services/create-service",
        undefined,
        ["super_admin", "content_manager", "vendor_manager"]
      ),
      createMenuItem(
        "service-areas",
        "Service Areas",
        "/dashboard/service-areas",
        <MapPin size={16} />,
        ["super_admin", "content_manager"]
      ),
    ]
  ),

  // Marketplace Section (properties / vendor focused roles)
  createSectionLabel("Marketplace", [
    "super_admin",
    "vendor_manager",
    "properties_manager",
  ]),
  createMenuWithChildren(
    "rental-property",
    "Rental & Property",
    <Home size={16} />,
    [
      createMenuItem(
        "all-properties",
        "All Properties",
        "/dashboard/marketplace/rental-property/all",
        undefined,
        ["super_admin", "vendor_manager", "properties_manager"]
      ),
      createMenuItem(
        "create-property",
        "Create New Property",
        "/dashboard/marketplace/rental-property/create",
        undefined,
        ["super_admin", "vendor_manager", "properties_manager"]
      ),
    ]
  ),
  createMenuWithChildren("work-force", "Work Force", <HardHat size={16} />, [
    createMenuItem(
      "workforce-workers",
      "Workers",
      "/dashboard/marketplace/workforce/workers",
      <UserCheck size={16} />,
      ["super_admin", "vendor_manager"]
    ),
    createMenuItem(
      "vendors",
      "Vendors",
      "/dashboard/marketplace/workforce/vendors",
      <Truck size={16} />,
      ["super_admin", "vendor_manager"]
    ),
  ]),
  createMenuWithChildren("projects", "Projects", <Building size={16} />, [
    createMenuItem(
      "all-projects",
      "All Projects",
      "/dashboard/marketplace/projects",
      undefined,
      ["super_admin", "vendor_manager", "properties_manager"]
    ),
    createMenuItem(
      "create-project",
      "Create New Project",
      "/dashboard/marketplace/projects/create",
      undefined,
      ["super_admin", "vendor_manager", "properties_manager"]
    ),
  ]),

  // Communication Section
  createSectionLabel("Communication"),
  createMenuItem(
    "chat",
    "Chat",
    "/dashboard/communication/chat",
    <MessageCircle size={16} />,
    [
      "super_admin",
      "support_agent",
      "booking_manager",
      "vendor_manager",
      "finance_manager",
      "content_manager",
      "properties_manager",
    ]
  ),
  createMenuItem(
    "fcm-notifications",
    "FCM Notifications",
    "/dashboard/notifications/fcm",
    <Bell size={16} />,
    ["super_admin", "support_agent", "content_manager"]
  ),

  // Other Section (content/finance/system)
  createSectionLabel("Other", [
    "super_admin",
    "content_manager",
    "finance_manager",
  ]),

  // Banner Management
  createMenuItem(
    "banners",
    "Banner Management",
    "/dashboard/banners",
    <ImageIcon size={16} />,
    ["super_admin", "content_manager"]
  ),

  // Website Management
  createMenuItem(
    "website-management",
    "Website Management",
    "/dashboard/website-management",
    <Settings size={16} />,
    ["super_admin", "content_manager"]
  ),

  // Subscription Management
  createMenuItem(
    "subscription-management",
    "Subscription Management",
    "/dashboard/subscription-management",
    <CreditCard size={16} />,
    ["super_admin", "finance_manager"]
  ),

  // Transaction Management
  createMenuItem(
    "transaction-management",
    "Transaction Management",
    "/dashboard/transactions",
    <CreditCard size={16} />,
    ["super_admin", "finance_manager"]
  ),

  // Ledger Management
  createMenuItem(
    "ledger-management",
    "Ledger Management",
    "/dashboard/ledger",
    <BookOpen size={16} />,
    ["super_admin", "finance_manager"]
  ),

  // System Section (super admin only)
  createSectionLabel("System", ["super_admin"]),

  // System Configuration
  createMenuItem(
    "admin-configs",
    "System Configuration",
    "/dashboard/admin-configs",
    <Settings size={16} />,
    ["super_admin"]
  ),
];
