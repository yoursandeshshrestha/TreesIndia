import React from "react";
import { LedgerSummary as LedgerSummaryType } from "../types";

interface LedgerSummaryProps {
  summary?: LedgerSummaryType;
}

const LedgerSummary: React.FC<LedgerSummaryProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div>
      {/* Statistics Summary - matching User Management pattern */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Cash in Hand</div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{summary.cash_in_hand.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Bank Balance</div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{summary.bank_balance.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">To be Paid</div>
          <div className="text-2xl font-bold text-red-600">
            ₹{summary.total_to_be_paid.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            To be Received
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{summary.total_to_be_received.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Total Paid</div>
          <div className="text-2xl font-bold text-green-600">
            ₹{summary.total_paid.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            Total Received
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{summary.total_received.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            Total Available
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{summary.total_available.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerSummary;
