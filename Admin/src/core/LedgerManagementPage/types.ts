export interface LedgerEntry {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Entry Details
  entry_type: "pay" | "receive";
  name: string;
  description?: string;

  // Financial Details
  amount_to_be_paid?: number;
  amount_to_receive?: number;
  amount_paid?: number;
  amount_received?: number;
  remaining_amount?: number; // Calculated remaining amount

  // Payment Source
  payment_source?: "cash" | "bank";

  // Status
  status: "pending" | "partial" | "completed";

  // Additional Info
  notes?: string;
  created_by: number;
  updated_by?: number;

  // Relationships
  created_by_user?: {
    id: number;
    name: string;
    phone: string;
  };
  updated_by_user?: {
    id: number;
    name: string;
    phone: string;
  };
}

export interface CashBankBalance {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Balance Details
  cash_in_hand: number;
  bank_balance: number;

  // Track changes
  last_transaction_amount: number;
  last_transaction_type?: string;
  last_transaction_source?: string;

  // Additional Info
  last_updated_by: number;
  notes?: string;

  // Relationships
  last_updated_by_user?: {
    id: number;
    name: string;
    phone: string;
  };
}

export interface LedgerSummary {
  total_to_be_paid: number;
  total_to_be_received: number;
  total_paid: number;
  total_received: number;
  cash_in_hand: number;
  bank_balance: number;
  total_available: number;
}

// Request/Response Types
export interface CreateLedgerEntryRequest {
  entry_type: "pay" | "receive";
  name: string;
  description?: string;
  amount_to_be_paid?: number;
  amount_to_receive?: number;
  amount_paid?: number;
  amount_received?: number;
  payment_source?: "cash" | "bank";
  notes?: string;
  [key: string]: unknown;
}

export interface UpdateLedgerEntryRequest {
  name?: string;
  description?: string;
  amount_to_be_paid?: number;
  amount_to_receive?: number;
  amount_paid?: number;
  amount_received?: number;
  payment_source?: "cash" | "bank";
  notes?: string;
  [key: string]: unknown;
}

export interface ProcessPaymentRequest {
  amount: number;
  payment_source: "cash" | "bank";
  notes?: string;
  [key: string]: unknown;
}

export interface UpdateBalanceRequest {
  cash_in_hand?: number;
  bank_balance?: number;
  notes?: string;
  [key: string]: unknown;
}

// Filter Types
export interface LedgerFilters {
  search: string;
  entry_type: "all" | "pay" | "receive";
  status: "all" | "pending" | "partial" | "completed";
  payment_source: "all" | "cash" | "bank";
  sort_by:
    | "created_at"
    | "name"
    | "amount_to_be_paid"
    | "amount_to_receive"
    | "amount_paid"
    | "amount_received";
  sort_order: "asc" | "desc";
}

// API Response Types
export interface LedgerEntriesResponse {
  success: boolean;
  data: {
    entries: LedgerEntry[];
    total: number;
    offset: number;
    limit: number;
  };
}

export interface LedgerEntryResponse {
  success: boolean;
  data: LedgerEntry;
}

export interface BalanceResponse {
  success: boolean;
  data: CashBankBalance;
}

export interface SummaryResponse {
  success: boolean;
  data: LedgerSummary;
}

// Form Types
export interface LedgerEntryFormData {
  entry_type: "pay" | "receive";
  name: string;
  description: string;
  amount_to_be_paid?: number;
  amount_to_receive?: number;
  amount_paid?: number;
  amount_received?: number;
  payment_source?: "cash" | "bank";
  notes: string;
}

export interface BalanceFormData {
  cash_in_hand: number;
  bank_balance: number;
  notes: string;
}

export interface PaymentFormData {
  amount: number;
  payment_source: "cash" | "bank";
  notes: string;
}

// Table Column Types
export interface LedgerTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

// Modal Types
export type LedgerModalType =
  | "create"
  | "edit"
  | "payment"
  | "receive"
  | "balance";

export interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LedgerModalType;
  entry?: LedgerEntry | null;
  onSuccess?: () => void;
}

// Statistics Types
export interface LedgerStats {
  total_entries: number;
  pending_payments: number;
  pending_receivables: number;
  completed_payments: number;
  completed_receivables: number;
  total_cash_flow: number;
}
