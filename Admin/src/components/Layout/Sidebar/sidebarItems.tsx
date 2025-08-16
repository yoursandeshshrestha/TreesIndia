import { LayoutDashboard, Building2, Users } from "lucide-react";

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
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
    id: "organizations",
    label: "Organizations",
    icon: <Building2 size={16} />,
    path: "/organizations",
  },
  {
    id: "users management",
    label: "Users Management",
    icon: <Users size={16} />,
    path: "/dashboard/users-management",
  },
];
