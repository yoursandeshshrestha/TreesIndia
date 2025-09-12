"use client";

import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/Badge";
import {
  Transaction,
  getStatusColor,
  getTypeColor,
  getMethodColor,
  formatCurrency,
  formatDate,
} from "@/types/transaction";

interface TransactionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function TransactionPreviewModal({
  isOpen,
  onClose,
  transaction,
}: TransactionPreviewModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !transaction) {
    return null;
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="ml-2 p-1 hover:bg-gray-100 rounded"
      title="Copy to clipboard"
    >
      {copiedField === field ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {transaction.payment_reference}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Reference
                </label>
                <div className="flex items-center">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {transaction.payment_reference}
                  </span>
                  <CopyButton
                    text={transaction.payment_reference}
                    field="reference"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Badge
                  variant="secondary"
                  className={getStatusColor(transaction.status)}
                >
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <Badge
                  variant="secondary"
                  className={getTypeColor(transaction.type)}
                >
                  {transaction.type.replace("_", " ").charAt(0).toUpperCase() +
                    transaction.type.replace("_", " ").slice(1)}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method
                </label>
                <Badge
                  variant="secondary"
                  className={getMethodColor(transaction.method)}
                >
                  {transaction.method.charAt(0).toUpperCase() +
                    transaction.method.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Information
                </label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-900">
                    {transaction.user.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {transaction.user.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    {transaction.user.phone}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Entity
                </label>
                <div className="text-sm text-gray-900">
                  {transaction.related_entity_type} #
                  {transaction.related_entity_id}
                </div>
              </div>

              {transaction.balance_after && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balance After Transaction
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(
                      transaction.balance_after,
                      transaction.currency
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description and Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                {transaction.description}
              </div>
            </div>

            {transaction.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {transaction.notes}
                </div>
              </div>
            )}
          </div>

          {/* Razorpay Information */}
          {(transaction.razorpay_order_id ||
            transaction.razorpay_payment_id) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Razorpay Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.razorpay_order_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order ID
                    </label>
                    <div className="flex items-center">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {transaction.razorpay_order_id}
                      </span>
                      <CopyButton
                        text={transaction.razorpay_order_id}
                        field="order_id"
                      />
                    </div>
                  </div>
                )}

                {transaction.razorpay_payment_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment ID
                    </label>
                    <div className="flex items-center">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {transaction.razorpay_payment_id}
                      </span>
                      <CopyButton
                        text={transaction.razorpay_payment_id}
                        field="payment_id"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Timestamps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initiated At
                </label>
                <div className="text-sm text-gray-900">
                  {formatDate(transaction.initiated_at)}
                </div>
              </div>

              {transaction.completed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completed At
                  </label>
                  <div className="text-sm text-green-600">
                    {formatDate(transaction.completed_at)}
                  </div>
                </div>
              )}

              {transaction.failed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Failed At
                  </label>
                  <div className="text-sm text-red-600">
                    {formatDate(transaction.failed_at)}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <div className="text-sm text-gray-900">
                  {formatDate(transaction.CreatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {transaction.metadata &&
            Object.keys(transaction.metadata).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Metadata</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                    {JSON.stringify(transaction.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
