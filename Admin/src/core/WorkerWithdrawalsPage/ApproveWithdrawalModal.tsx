import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/Button/Base/Button';
import { type WorkerWithdrawal } from '@/services/workerWithdrawalService';

interface ApproveWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<void>;
  withdrawal: WorkerWithdrawal;
}

export default function ApproveWithdrawalModal({
  isOpen,
  onClose,
  onConfirm,
  withdrawal,
}: ApproveWithdrawalModalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(notes || undefined);
      setNotes('');
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

        <h2 className="mb-4 text-xl font-bold text-gray-900">Approve Withdrawal Request</h2>

        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Worker</p>
              <p className="mt-1 text-sm text-gray-900">{withdrawal.user?.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Amount</p>
              <p className="mt-1 text-lg font-bold text-green-600">
                {formatCurrency(withdrawal.amount)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-500">Bank Details</p>
              <p className="mt-1 text-sm text-gray-900">
                {withdrawal.bank_name} - {withdrawal.account_number}
              </p>
              <p className="text-sm text-gray-600">
                {withdrawal.account_name} (IFSC: {withdrawal.ifsc_code})
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Admin Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Add any notes about this approval..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Approving this withdrawal will deduct {formatCurrency(withdrawal.amount)} from the worker&apos;s wallet balance.
              Please ensure the amount will be transferred to the worker&apos;s bank account offline.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="success">
              {loading ? 'Approving...' : 'Approve Withdrawal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
