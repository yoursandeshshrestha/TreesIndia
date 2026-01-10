import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/Button/Base/Button';
import { type WorkerWithdrawal } from '@/services/workerWithdrawalService';

interface RejectWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  withdrawal: WorkerWithdrawal;
}

export default function RejectWithdrawalModal({
  isOpen,
  onClose,
  onConfirm,
  withdrawal,
}: RejectWithdrawalModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onConfirm(reason);
      setReason('');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-xl font-bold text-gray-900">Reject Withdrawal Request</h2>

        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Worker</p>
              <p className="mt-1 text-sm text-gray-900">{withdrawal.user?.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Amount</p>
              <p className="mt-1 text-lg font-bold text-red-600">
                {formatCurrency(withdrawal.amount)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-500">Payment Reference</p>
              <p className="mt-1 text-sm text-gray-900">
                {withdrawal.payment_reference}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason for Rejection <span className="text-red-600">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows={4}
              className={`mt-1 block w-full rounded-md border ${
                error ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="Explain why this withdrawal request is being rejected..."
              required
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> The worker will be notified about this rejection.
              The amount will remain in their wallet and they can submit a new request.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="danger"
            >
              {loading ? 'Rejecting...' : 'Reject Withdrawal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
