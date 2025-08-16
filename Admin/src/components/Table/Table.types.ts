import type { ReactNode } from "react";

export interface Action<T> {
  label: string | ((row: T) => string);
  icon?: ReactNode;
  onClick: (row: T) => void;
  className?: string | ((row: T) => string);
  disabled?: (row: T) => boolean;
}

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  width?: string;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  onSort?: (column: keyof T, direction: "asc" | "desc") => void;
  currentSort?: {
    column: keyof T;
    direction: "asc" | "desc";
  };
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  className?: string;
  emptyState?: ReactNode;
  loading?: boolean;
  loadingState?: ReactNode;
  actions?: Action<T>[];
}
