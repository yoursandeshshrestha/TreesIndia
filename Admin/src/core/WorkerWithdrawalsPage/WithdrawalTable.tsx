import React from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/Button/Base/Button';
import { type WorkerWithdrawal } from '@/services/workerWithdrawalService';

interface WithdrawalTableProps {
  withdrawals: WorkerWithdrawal[];
  loading: boolean;
  onApprove: (withdrawal: WorkerWithdrawal) => void;
  onReject: (withdrawal: WorkerWithdrawal) => void;
  onViewDetails: (withdrawal: WorkerWithdrawal) => void;
}

export default function WithdrawalTable({
  withdrawals,
  loading,
  onApprove,
  onReject,
  onViewDetails,
}: WithdrawalTableProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
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
        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="text-center">
          <p className="text-gray-500">No withdrawal requests found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Payment Reference
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Worker
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Bank Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Requested At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {withdrawals.map((withdrawal) => (
            <tr key={withdrawal.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {withdrawal.payment_reference}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{withdrawal.user?.name || 'N/A'}</div>
                <div className="text-xs text-gray-500">{withdrawal.user?.email}</div>
                <div className="text-xs text-gray-500">{withdrawal.user?.phone}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(withdrawal.amount)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{withdrawal.account_name}</div>
                <div className="text-xs text-gray-500">
                  {withdrawal.bank_name} - {withdrawal.account_number.slice(-4).padStart(withdrawal.account_number.length, 'X')}
                </div>
                <div className="text-xs text-gray-500">{withdrawal.ifsc_code}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {getStatusBadge(withdrawal.status)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatDate(withdrawal.requested_at)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(withdrawal)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {withdrawal.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApprove(withdrawal)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReject(withdrawal)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
