"use client";

import { Eye, CreditCard } from "lucide-react";
import { Badge } from "@/components/Badge";
import Table from "@/components/Table/Table";
import {
  Transaction,
  getStatusColor,
  getTypeColor,
  getMethodColor,
  formatCurrency,
  formatDate,
} from "@/types/transaction";

interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

export default function TransactionTable({
  transactions,
  onTransactionClick,
}: TransactionTableProps) {
  const columns = [
    {
      header: "Reference",
      accessor: (transaction: Transaction) => (
        <div className="font-mono text-sm">{transaction.payment_reference}</div>
      ),
    },
    {
      header: "User",
      accessor: (transaction: Transaction) => (
        <div>
          <div className="font-medium text-gray-900">
            {transaction.user.name || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {transaction.user.email || transaction.user.phone}
          </div>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: (transaction: Transaction) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            {formatCurrency(transaction.amount, transaction.currency)}
          </div>
          {transaction.balance_after && (
            <div className="text-xs text-gray-500">
              Balance:{" "}
              {formatCurrency(transaction.balance_after, transaction.currency)}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (transaction: Transaction) => (
        <Badge
          variant="secondary"
          className={getStatusColor(transaction.status)}
        >
          {transaction.status.charAt(0).toUpperCase() +
            transaction.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Type",
      accessor: (transaction: Transaction) => (
        <Badge variant="secondary" className={getTypeColor(transaction.type)}>
          {transaction.type.replace("_", " ").charAt(0).toUpperCase() +
            transaction.type.replace("_", " ").slice(1)}
        </Badge>
      ),
    },
    {
      header: "Method",
      accessor: (transaction: Transaction) => (
        <Badge
          variant="secondary"
          className={getMethodColor(transaction.method)}
        >
          {transaction.method.charAt(0).toUpperCase() +
            transaction.method.slice(1)}
        </Badge>
      ),
    },
    {
      header: "Description",
      accessor: (transaction: Transaction) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900 truncate">
            {transaction.description}
          </div>
          {transaction.related_entity_type && (
            <div className="text-xs text-gray-500">
              {transaction.related_entity_type} #{transaction.related_entity_id}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Date",
      accessor: (transaction: Transaction) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {formatDate(transaction.CreatedAt)}
          </div>
          {transaction.completed_at && (
            <div className="text-xs text-green-600">
              Completed: {formatDate(transaction.completed_at)}
            </div>
          )}
          {transaction.failed_at && (
            <div className="text-xs text-red-600">
              Failed: {formatDate(transaction.failed_at)}
            </div>
          )}
          {transaction.refunded_at && (
            <div className="text-xs text-blue-600">
              Refunded: {formatDate(transaction.refunded_at)}
            </div>
          )}
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: "View",
      icon: <Eye size={14} />,
      onClick: onTransactionClick,
      className: "text-blue-700 bg-blue-100 hover:bg-blue-200",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <Table<Transaction>
        data={transactions}
        columns={columns}
        keyField="ID"
        actions={actions}
        emptyState={
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">
              No transactions found
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        }
      />
    </div>
  );
}
