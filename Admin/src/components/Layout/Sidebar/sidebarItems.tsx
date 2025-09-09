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
} from "lucide-react";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  isGroup?: boolean;
}

// Helper function to create section labels
export const createSectionLabel = (label: string): SidebarItem => ({
  id: `${label.toLowerCase().replace(/\s+/g, "-")}-group`,
  label,
  isGroup: true,
});

// Helper function to create menu items
export const createMenuItem = (
  id: string,
  label: string,
  path: string,
  icon?: React.ReactNode
): SidebarItem => ({
  id,
  label,
  path,
  icon,
});

// Helper function to create menu items with children
export const createMenuWithChildren = (
  id: string,
  label: string,
  icon: React.ReactNode,
  children: SidebarItem[]
): SidebarItem => ({
  id,
  label,
  icon,
  children,
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
        <Users size={16} />
      ),
      createMenuItem(
        "role-applications",
        "Role Applications",
        "/dashboard/role-applications",
        <FileText size={16} />
      ),
      createMenuItem(
        "workers",
        "Workers",
        "/dashboard/workers",
        <Users size={16} />
      ),
      createMenuItem(
        "brokers",
        "Brokers",
        "/dashboard/brokers",
        <Shield size={16} />
      ),
    ]
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
        "/dashboard/bookings/overview"
      ),
      createMenuItem("all-bookings", "All Bookings", "/dashboard/bookings/all"),
      createMenuItem(
        "fixed-price-bookings",
        "Fixed Price Bookings",
        "/dashboard/bookings/fixed-price"
      ),
      createMenuItem(
        "inquiry-price-bookings",
        "Inquiry Price Bookings",
        "/dashboard/bookings/inquiry-price"
      ),
    ]
  ),

  // Services Section
  createSectionLabel("Services"),

  // Category Management Section
  createMenuWithChildren(
    "categories",
    "Category Management",
    <Layers size={16} />,
    [
      createMenuItem("categories", "Categories", "/dashboard/categories"),
      createMenuItem(
        "subcategories",
        "Subcategories",
        "/dashboard/subcategories"
      ),
    ]
  ),

  // Service Management Section
  createMenuWithChildren(
    "services",
    "Service Management",
    <Package size={16} />,
    [
      createMenuItem("list-services", "List Services", "/dashboard/services"),
      createMenuItem(
        "create-service",
        "Create New Service",
        "/dashboard/services/create-service"
      ),
    ]
  ),

  // Marketplace Section
  createSectionLabel("Marketplace"),
  createMenuWithChildren(
    "rental-property",
    "Rental & Property",
    <Home size={16} />,
    [
      createMenuItem(
        "all-properties",
        "All Properties",
        "/dashboard/marketplace/rental-property/all"
      ),
      createMenuItem(
        "create-property",
        "Create New Property",
        "/dashboard/marketplace/rental-property/create"
      ),
    ]
  ),
  createMenuWithChildren("manforce", "Manforce", <HardHat size={16} />, [
    createMenuItem(
      "workers",
      "Workers",
      "/dashboard/marketplace/manforce/workers",
      <UserCheck size={16} />
    ),
    createMenuItem(
      "vendors",
      "Vendors",
      "/dashboard/marketplace/manforce/vendors",
      <Truck size={16} />
    ),
  ]),
  createMenuItem(
    "projects",
    "Projects",
    "/dashboard/marketplace/projects",
    <Building size={16} />
  ),

  // Other Section
  createSectionLabel("Other"),

  // Banner Management
  createMenuItem(
    "banners",
    "Banner Management",
    "/dashboard/banners",
    <ImageIcon size={16} />
  ),

  // Website Management
  createMenuItem(
    "website-management",
    "Website Management",
    "/dashboard/website-management",
    <Settings size={16} />
  ),

  // Subscription Management
  createMenuItem(
    "subscription-management",
    "Subscription Management",
    "/dashboard/subscription-management",
    <CreditCard size={16} />
  ),

  // System Section
  createSectionLabel("System"),

  // System Configuration
  createMenuItem(
    "admin-configs",
    "System Configuration",
    "/dashboard/admin-configs",
    <Settings size={16} />
  ),
];
