import { ChevronUp, ChevronDown } from "lucide-react";
import type { TableProps } from "./Table.types";

const Table = <T extends object>({
  columns,
  data,
  keyField,
  onRowClick,
  sortable = false,
  onSort,
  currentSort,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  className = "",
  loading = false,
  loadingState,
  actions = [],
}: TableProps<T>) => {
  const handleSort = (column: keyof T) => {
    if (!sortable || !onSort) return;

    const direction =
      currentSort?.column === column && currentSort.direction === "asc"
        ? "desc"
        : "asc";
    onSort(column, direction);
  };

  const handleSelectRow = (row: T) => {
    if (!selectable || !onSelectionChange) return;

    const isSelected = selectedRows.some(
      (selected) => selected[keyField] === row[keyField]
    );

    if (isSelected) {
      onSelectionChange(
        selectedRows.filter((selected) => selected[keyField] !== row[keyField])
      );
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const handleSelectAll = () => {
    if (!selectable || !onSelectionChange) return;

    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...data]);
    }
  };

  const handleActionClick = (
    e: React.MouseEvent,
    action: (row: T) => void,
    row: T
  ) => {
    e.stopPropagation();
    action(row);
  };

  if (loading) {
    return (
      <div className="w-full">
        {loadingState || (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto shadow  ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedRows.length === data.length}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ""
                  }`}
                  style={{ width: column.width }}
                >
                  <div
                    className={`flex items-center space-x-1 ${
                      column.sortable ? "cursor-pointer" : ""
                    }`}
                    onClick={() =>
                      column.sortable && handleSort(column.accessor as keyof T)
                    }
                  >
                    <span className="truncate">{column.header}</span>
                    {column.sortable &&
                      currentSort?.column === column.accessor && (
                        <span className="inline-flex items-center flex-shrink-0">
                          {currentSort.direction === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th
                  scope="col"
                  className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button, input"))
                    return;
                  if (selectable && onSelectionChange) {
                    handleSelectRow(row);
                  } else if (onRowClick) {
                    onRowClick(row);
                  }
                }}
                className={`
                  ${selectable ? "cursor-pointer hover:bg-gray-50" : ""}
                  ${
                    onRowClick && !selectable
                      ? "cursor-pointer hover:bg-gray-50"
                      : ""
                  }
                `}
              >
                {selectable && (
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedRows.some(
                        (selected) => selected[keyField] === row[keyField]
                      )}
                      onChange={() => handleSelectRow(row)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className={`px-3 py-4 ${column.className || ""}`}
                    style={{ width: column.width }}
                  >
                    <div className="min-w-0">
                      {typeof column.accessor === "function"
                        ? column.accessor(row)
                        : String(row[column.accessor])}
                    </div>
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      {actions.map((action, index) => {
                        const isDisabled = action.disabled?.(row);
                        return (
                          <button
                            key={index}
                            onClick={(e) =>
                              handleActionClick(e, action.onClick, row)
                            }
                            disabled={isDisabled}
                            className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded ${
                              isDisabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : typeof action.className === "function"
                                ? action.className(row)
                                : action.className ||
                                  "text-blue-700 bg-blue-100 hover:bg-blue-200"
                            }`}
                          >
                            {action.icon && (
                              <span className="mr-1">{action.icon}</span>
                            )}
                            {typeof action.label === "function"
                              ? action.label(row)
                              : action.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
