import type { Option } from "../SearchableDropdown/SearchableDropdown.types";

export interface MultiSelectDropdownProps {
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
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
}
