'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import CustomInput from '@/components/Input/Base/Input';
import SearchableDropdown from '@/components/SearchableDropdown/SearchableDropdown';
import Button from '@/components/Button/Base/Button';
import {
  workerWithdrawalService,
  type WorkerWithdrawal,
  type WorkerWithdrawalFilters,
} from '@/services/workerWithdrawalService';
import WithdrawalTable from './WithdrawalTable';
import ApproveWithdrawalModal from './ApproveWithdrawalModal';
import RejectWithdrawalModal from './RejectWithdrawalModal';
import WithdrawalDetailsModal from './WithdrawalDetailsModal';

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function WorkerWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WorkerWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<WorkerWithdrawalFilters>({
    status: undefined,
    search: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });

  // Modal states
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WorkerWithdrawal | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalPending: 0,
    totalCompleted: 0,
    totalPendingAmount: 0,
    totalCompletedAmount: 0,
  });

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workerWithdrawalService.getAllWithdrawals(filters);
      setWithdrawals(data.withdrawals);
      if (data.pagination) {
        setPagination(data.pagination);
      }

      // Calculate statistics
      const pending = data.withdrawals.filter((w) => w.status === 'pending');
      const completed = data.withdrawals.filter((w) => w.status === 'completed');
      setStats({
        totalPending: pending.length,
        totalCompleted: completed.length,
        totalPendingAmount: pending.reduce((sum, w) => sum + w.amount, 0),
        totalCompletedAmount: completed.reduce((sum, w) => sum + w.amount, 0),
      });
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value as any,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: undefined,
      search: '',
      page: 1,
      limit: 10,
    });
  };

  const handleApprove = (withdrawal: WorkerWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowApproveModal(true);
  };

  const handleReject = (withdrawal: WorkerWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
  };

  const handleViewDetails = (withdrawal: WorkerWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  const handleApproveConfirm = async (notes?: string) => {
    if (!selectedWithdrawal) return;

    try {
      await workerWithdrawalService.approveWithdrawal(selectedWithdrawal.id, { notes });
      toast.success('Withdrawal approved successfully');
      setShowApproveModal(false);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve withdrawal');
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedWithdrawal) return;

    try {
      await workerWithdrawalService.rejectWithdrawal(selectedWithdrawal.id, reason);
      toast.success('Withdrawal rejected successfully');
      setShowRejectModal(false);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject withdrawal');
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Worker Withdrawals</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage worker withdrawal requests and payments
          </p>
        </div>
        <Button
          onClick={fetchWithdrawals}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="mt-6 mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Requests</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalPending}</p>
            <p className="mt-1 text-sm text-gray-500">
              {formatCurrency(stats.totalPendingAmount)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalCompleted}</p>
            <p className="mt-1 text-sm text-gray-500">
              {formatCurrency(stats.totalCompletedAmount)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Amount</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalPendingAmount + stats.totalCompletedAmount)}
            </p>
            <p className="mt-1 text-sm text-gray-500">All withdrawals</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Requests</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{withdrawals.length}</p>
            <p className="mt-1 text-sm text-gray-500">All time</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-end gap-3">
        <div className="flex-1">
          <CustomInput
            placeholder="Search by worker name, payment reference..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-48">
          <SearchableDropdown
            options={STATUS_OPTIONS}
            value={filters.status || ''}
            onChange={(value) => handleStatusChange(value as string)}
            placeholder="Filter by status"
          />
        </div>
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>

      {/* Withdrawals Table */}
      <WithdrawalTable
        withdrawals={withdrawals}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewDetails={handleViewDetails}
      />

      {/* Modals */}
      {selectedWithdrawal && (
        <>
          <ApproveWithdrawalModal
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            onConfirm={handleApproveConfirm}
            withdrawal={selectedWithdrawal}
          />

          <RejectWithdrawalModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            onConfirm={handleRejectConfirm}
            withdrawal={selectedWithdrawal}
          />

          <WithdrawalDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            withdrawal={selectedWithdrawal}
          />
        </>
      )}
    </div>
  );
}
