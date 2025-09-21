"use client";

import { useEffect, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionStats } from "@/types/transaction";
import { formatCurrency } from "@/types/transaction";

interface TransactionStatsCardsProps {
  refreshTrigger?: number;
}

export default function TransactionStatsCards({
  refreshTrigger,
}: TransactionStatsCardsProps) {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchTransactionStats } = useTransactions();

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      const statsData = await fetchTransactionStats();
      setStats(statsData);
      setIsLoading(false);
    };

    loadStats();
  }, [fetchTransactionStats, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statsCards = [
    {
      title: "Total Transactions",
      value: (stats.total_transactions || 0).toLocaleString(),
      amount: "Count",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Amount",
      value: formatCurrency(stats.total_amount || 0),
      amount: "Revenue",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Completed",
      value: (stats.completed_transactions || 0).toLocaleString(),
      amount: "Success",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending",
      value: (stats.pending_transactions || 0).toLocaleString(),
      amount: "Awaiting",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Failed",
      value: (stats.failed_transactions || 0).toLocaleString(),
      amount: "Issues",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 py-6">
      {statsCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div>
            <p className="text-sm text-gray-600">{card.title}</p>
            <p className={`text-2xl font-semibold ${card.color}`}>
              {card.value}
            </p>
            <p className="text-sm text-gray-500 mt-1">{card.amount}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
