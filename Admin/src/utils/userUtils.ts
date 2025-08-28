import { User, UserType, Gender } from "@/types/user";
import { User as UserIcon, Shield, Crown } from "lucide-react";

// User Type Options
export const USER_TYPE_OPTIONS = [
  { label: "Normal", value: "normal" as UserType, icon: UserIcon },
  { label: "Worker", value: "worker" as UserType, icon: Shield },
  { label: "Broker", value: "broker" as UserType, icon: Crown },
  { label: "Admin", value: "admin" as UserType, icon: Crown },
];

export const USER_TYPE_FILTER_OPTIONS = [
  { label: "All Types", value: "" },
  ...USER_TYPE_OPTIONS.map(({ label, value }) => ({ label, value })),
];

// Gender Options
export const GENDER_OPTIONS = [
  { label: "Male", value: "male" as Gender },
  { label: "Female", value: "female" as Gender },
  { label: "Other", value: "other" as Gender },
  { label: "Prefer not to say", value: "prefer_not_to_say" as Gender },
];



// Status Options
export const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export const SUBSCRIPTION_OPTIONS = [
  { label: "All Subscriptions", value: "" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

// Color Mappings
export const getUserTypeColor = (userType: UserType): string => {
  const colors: Record<UserType, string> = {
    normal: "bg-gray-100 text-gray-800",
    worker: "bg-blue-100 text-blue-800",
    broker: "bg-green-100 text-green-800",
    admin: "bg-red-100 text-red-800",
  };
  return colors[userType] || colors.normal;
};

export const getStatusColor = (isActive: boolean): string => {
  return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
};



// Icon Mappings
export const getUserTypeIcon = (userType: UserType) => {
  const icons: Record<UserType, typeof UserIcon> = {
    normal: UserIcon,
    worker: Shield,
    broker: Crown,
    admin: Crown,
  };
  return icons[userType] || UserIcon;
};

// Formatting Functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export const formatDate = (dateString: string, includeTime = false): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: includeTime ? "long" : "short",
    day: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return new Date(dateString).toLocaleDateString("en-US", options);
};

export const formatUserType = (userType: UserType): string => {
  return userType.charAt(0).toUpperCase() + userType.slice(1);
};



export const formatGender = (gender: Gender): string => {
  return (
    gender.replace("_", " ").charAt(0).toUpperCase() +
    gender.replace("_", " ").slice(1)
  );
};

// Validation Functions
export const validateUserForm = (
  formData: Partial<User>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.name?.trim()) {
    errors.name = "Name is required";
  }

  if (!formData.phone?.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
    errors.phone = "Please enter a valid phone number";
  }

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (formData.wallet_balance !== undefined && formData.wallet_balance < 0) {
    errors.wallet_balance = "Wallet balance cannot be negative";
  }



  return errors;
};

// Default User Data
export const getDefaultUserData = (): Partial<User> => ({
  name: "",
  email: "",
  phone: "",
  user_type: "normal",
  gender: undefined,
  is_active: true,
  wallet_balance: 0,
  has_active_subscription: false,
  subscription_expiry_date: undefined,
});

// Subscription Utilities
export const getDaysRemaining = (expiryDate: string): number => {
  return Math.ceil(
    (new Date(expiryDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );
};

export const getAvailableCredit = (user: User): number => {
  // Since we removed wallet_limit, we'll use a default max balance from admin config
  // This should be replaced with actual admin config value when available
  const defaultMaxBalance = 100000;
  return defaultMaxBalance - user.wallet_balance;
};
