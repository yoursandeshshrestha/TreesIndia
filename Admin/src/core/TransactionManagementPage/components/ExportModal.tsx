"use client";

import { useState } from "react";
import { X, Download, FileText } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import { Checkbox } from "@/components/Checkbox";
import Select from "@/components/Select/Select";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionFilters } from "@/types/transaction";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onSuccess: () => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  filters,
  onSuccess,
}: ExportModalProps) {
  const [format, setFormat] = useState<"csv" | "excel">("csv");
  const [includeUserDetails, setIncludeUserDetails] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { exportTransactions } = useTransactions();

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsExporting(true);

    try {
      const blob = await exportTransactions({
        filters,
        format,
        include_user_details: includeUserDetails,
        include_metadata: includeMetadata,
      });

      if (blob) {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split("T")[0];
        const filename = `transactions_${timestamp}.${format}`;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setFormat("csv");
    setIncludeUserDetails(true);
    setIncludeMetadata(false);
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.type) count++;
    if (filters.method) count++;
    if (filters.user_email) count++;
    if (filters.user_phone) count++;
    if (filters.min_amount) count++;
    if (filters.max_amount) count++;
    if (filters.start_date) count++;
    if (filters.end_date) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Export Transactions
              </h2>
              <p className="text-sm text-gray-500">Download transaction data</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Export Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                Export Summary
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• All transactions matching current filters</div>
              {activeFiltersCount > 0 && (
                <div>
                  • {activeFiltersCount} active filter
                  {activeFiltersCount > 1 ? "s" : ""} applied
                </div>
              )}
              <div>• Format: {format.toUpperCase()}</div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <Select
              value={format}
              onChange={(value) => setFormat(value as "csv" | "excel")}
              options={[
                { value: "csv", label: "CSV (Comma Separated Values)" },
                { value: "excel", label: "Excel (.xlsx)" },
              ]}
            />
            <p className="mt-1 text-xs text-gray-500">
              CSV is recommended for large datasets and data analysis
            </p>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Include Additional Data
            </label>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="include-user-details"
                  checked={includeUserDetails}
                  onChange={(e) => setIncludeUserDetails(e.target.checked)}
                />
                <label
                  htmlFor="include-user-details"
                  className="text-sm text-gray-700"
                >
                  <div className="font-medium">User Details</div>
                  <div className="text-xs text-gray-500">
                    Include user name, email, and phone number
                  </div>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="include-metadata"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                />
                <label
                  htmlFor="include-metadata"
                  className="text-sm text-gray-700"
                >
                  <div className="font-medium">Metadata</div>
                  <div className="text-xs text-gray-500">
                    Include payment metadata and additional information
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Active Filters Preview */}
          {activeFiltersCount > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Active Filters
              </label>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-800">
                  {filters.search && (
                    <div>• Search: &quot;{filters.search}&quot;</div>
                  )}
                  {filters.status && <div>• Status: {filters.status}</div>}
                  {filters.type && <div>• Type: {filters.type}</div>}
                  {filters.method && <div>• Method: {filters.method}</div>}
                  {filters.user_email && (
                    <div>• User Email: {filters.user_email}</div>
                  )}
                  {filters.user_phone && (
                    <div>• User Phone: {filters.user_phone}</div>
                  )}
                  {filters.min_amount && (
                    <div>• Min Amount: ₹{filters.min_amount}</div>
                  )}
                  {filters.max_amount && (
                    <div>• Max Amount: ₹{filters.max_amount}</div>
                  )}
                  {filters.start_date && (
                    <div>• Start Date: {filters.start_date}</div>
                  )}
                  {filters.end_date && (
                    <div>• End Date: {filters.end_date}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isExporting}
              className="flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
