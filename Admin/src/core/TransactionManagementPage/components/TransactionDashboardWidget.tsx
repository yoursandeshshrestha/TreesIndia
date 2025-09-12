"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionDashboardData, formatCurrency } from "@/types/transaction";

interface TransactionDashboardWidgetProps {
  className?: string;
}

export default function TransactionDashboardWidget({
  className = "",
}: TransactionDashboardWidgetProps) {
  const [dashboardData, setDashboardData] =
    useState<TransactionDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchDashboardData } = useTransactions();

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      const data = await fetchDashboardData();
      setDashboardData(data);
      setIsLoading(false);
    };

    loadDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="text-center text-gray-500">
          <CreditCard className="h-8 w-8 mx-auto mb-2" />
          <p>Unable to load transaction data</p>
        </div>
      </div>
    );
  }

  const { overview } = dashboardData;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Transaction Overview
          </h3>
        </div>
        <a
          href="/dashboard/transactions"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </a>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {(overview.total_transactions || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Transactions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(overview.total_amount || 0)}
          </div>
          <div className="text-sm text-gray-500">Total Amount</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {overview.completed_transactions || 0} transactions
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {overview.pending_transactions || 0} transactions
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Failed</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {overview.failed_transactions || 0} transactions
          </div>
        </div>
      </div>
    </div>
  );
}
