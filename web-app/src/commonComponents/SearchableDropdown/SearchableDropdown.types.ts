import type { ReactNode } from "react";

export interface Option {
  label: string;
  value: string | number;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SearchableDropdownProps {
  options: Option[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  maxHeight?: string;
  width?: string;
  onOpen?: () => void;
}
