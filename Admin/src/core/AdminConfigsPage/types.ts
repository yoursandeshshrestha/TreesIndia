export interface AdminConfig {
  ID: number;
  key: string;
  value: string;
  type: "string" | "int" | "float" | "bool";
  category: AdminConfigCategory;
  description: string;
  is_active: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
}

export type AdminConfigCategory =
  | "wallet"
  | "property"
  | "service"
  | "system"
  | "payment"
  | "booking";

export const CONFIG_CATEGORIES: {
  value: AdminConfigCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "wallet",
    label: "Wallet System",
    description: "Wallet limits and transaction settings",
  },
  {
    value: "property",
    label: "Property System",
    description: "Property listing and approval settings",
  },
  {
    value: "service",
    label: "Service System",
    description: "Service booking and management settings",
  },
  {
    value: "system",
    label: "System Settings",
    description: "General system configuration",
  },
  {
    value: "payment",
    label: "Payment System",
    description: "Payment gateway and transaction settings",
  },
  {
    value: "booking",
    label: "Booking System",
    description: "Booking and working hours settings",
  },
];
