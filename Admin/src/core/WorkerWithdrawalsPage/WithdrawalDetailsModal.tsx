import React from 'react';
import { X } from 'lucide-react';
import Button from '@/components/Button/Base/Button';
import { type WorkerWithdrawal } from '@/services/workerWithdrawalService';

interface WithdrawalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: WorkerWithdrawal;
}

export default function WithdrawalDetailsModal({
  isOpen,
  onClose,
  withdrawal,
}: WithdrawalDetailsModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-xl font-bold text-gray-900">Withdrawal Request Details</h2>

        <div className="space-y-6">
          {/* Status and Payment Reference */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Payment Reference</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {withdrawal.payment_reference}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(withdrawal.status)}</div>
              </div>
            </div>
          </div>

          {/* Worker Information */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Worker Information</h3>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Name</p>
                  <p className="mt-1 text-sm text-gray-900">{withdrawal.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{withdrawal.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Phone</p>
                  <p className="mt-1 text-sm text-gray-900">{withdrawal.user?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Amount Details</h3>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Withdrawal Amount</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {formatCurrency(withdrawal.amount)}
              </p>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Bank Account Details</h3>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Account Name</p>
                  <p className="mt-1 text-sm text-gray-900">{withdrawal.account_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Account Number</p>
                  <p className="mt-1 text-sm text-gray-900">{withdrawal.account_number}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Bank Name</p>
                  <p className="mt-1 text-sm text-gray-900">{withdrawal.bank_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">IFSC Code</p>
                  <p className="mt-1 text-sm text-gray-900">{withdrawal.ifsc_code}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Request Information */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Request Information</h3>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Requested At</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(withdrawal.requested_at)}
                  </p>
                </div>
                {withdrawal.processed_at && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Processed At</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(withdrawal.processed_at)}
                    </p>
                  </div>
                )}
                {withdrawal.processed_by_name && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-gray-500">Processed By</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {withdrawal.processed_by_name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {withdrawal.notes && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Worker Notes</h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">{withdrawal.notes}</p>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {withdrawal.rejection_reason && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Rejection Reason</h3>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{withdrawal.rejection_reason}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
