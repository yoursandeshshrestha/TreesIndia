export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  isGroup?: boolean;
}

export interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  activeItem?: string;
}
