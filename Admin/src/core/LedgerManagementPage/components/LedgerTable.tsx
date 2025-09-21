import React from "react";
import { Edit2, Trash2, IndianRupee } from "lucide-react";
import Table from "@/components/Table/Table";
import { LedgerEntry } from "../types";

interface LedgerTableProps {
  entries: LedgerEntry[];
  isLoading?: boolean;
  onEdit: (entry: LedgerEntry) => void;
  onDelete: (entry: LedgerEntry) => void;
  onProcessPayment: (entry: LedgerEntry) => void;
  onProcessReceive: (entry: LedgerEntry) => void;
}

const LedgerTable: React.FC<LedgerTableProps> = ({
  entries,
  isLoading = false,
  onEdit,
  onDelete,
  onProcessPayment,
  onProcessReceive,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "partial":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount?: number) => {
    if (amount === undefined || amount === null) return "—";
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="mt-2">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading entries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="mt-2">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No ledger entries
            </h3>
            <p className="text-gray-500">
              Get started by creating your first ledger entry.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={[
            {
              header: "Entry Information",
              accessor: (row: LedgerEntry) => (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {row.name}
                  </div>
                  {row.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {row.description}
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: "Type & Status",
              accessor: (row: LedgerEntry) => (
                <div className="space-y-2">
                  <div>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {row.entry_type}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Amounts",
              accessor: (row: LedgerEntry) => (
                <div className="space-y-1 text-sm">
                  {row.entry_type === "pay" ? (
                    <div>
                      <div className="font-medium text-gray-900">
                        To Pay: {formatAmount(row.amount_to_be_paid)}
                      </div>
                      <div className="text-gray-500">
                        Paid: {formatAmount(row.amount_paid)}
                      </div>
                      {row.remaining_amount && row.remaining_amount > 0 && (
                        <div className="text-red-600 font-medium">
                          Remaining: {formatAmount(row.remaining_amount)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-900">
                        To Receive: {formatAmount(row.amount_to_receive)}
                      </div>
                      <div className="text-gray-500">
                        Received: {formatAmount(row.amount_received)}
                      </div>
                      {row.remaining_amount && row.remaining_amount > 0 && (
                        <div className="text-green-600 font-medium">
                          Remaining: {formatAmount(row.remaining_amount)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: "Payment Source & Date",
              accessor: (row: LedgerEntry) => (
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600">
                    <span className="capitalize">
                      {row.payment_source || "—"}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    <span>{formatDate(row.created_at)}</span>
                  </div>
                </div>
              ),
            },
          ]}
          data={entries}
          keyField="id"
          selectable={false}
          actions={[
            {
              label: (row: LedgerEntry) =>
                row.entry_type === "pay"
                  ? "Process Payment"
                  : "Process Receive",
              onClick: (row: LedgerEntry) =>
                row.entry_type === "pay"
                  ? onProcessPayment(row)
                  : onProcessReceive(row),
              className: (row: LedgerEntry) =>
                row.entry_type === "pay"
                  ? "text-blue-700 bg-blue-100 hover:bg-blue-200"
                  : "text-green-700 bg-green-100 hover:bg-green-200",
              icon: <IndianRupee size={14} />,
              disabled: (row: LedgerEntry) => row.status === "completed",
            },
            {
              label: "Edit Entry",
              onClick: (row: LedgerEntry) => onEdit(row),
              className: "text-blue-700 bg-blue-100 hover:bg-blue-200",
              icon: <Edit2 size={14} />,
            },
            {
              label: "Delete",
              onClick: (row: LedgerEntry) => onDelete(row),
              className: "text-red-700 bg-red-100 hover:bg-red-200",
              icon: <Trash2 size={14} />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default LedgerTable;
