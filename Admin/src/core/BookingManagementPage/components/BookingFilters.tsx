import React from "react";
import { Search } from "lucide-react";
import CustomInput from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Button from "@/components/Button/Base/Button";

interface BookingFiltersProps {
  search: string;
  status: string;
  bookingType: string;
  paymentStatus: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onBookingTypeChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
  onClear: () => void;
  isSearching?: boolean;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
  search,
  status,
  bookingType,
  paymentStatus,
  onSearchChange,
  onStatusChange,
  onBookingTypeChange,
  onPaymentStatusChange,
  onClear,
  isSearching = false,
}) => {
  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Quote Provided", value: "quote_provided" },
    { label: "Quote Accepted", value: "quote_accepted" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Assigned", value: "assigned" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Rejected", value: "rejected" },
  ];

  const bookingTypeOptions = [
    { label: "All Types", value: "" },
    { label: "Fixed Price", value: "regular" },
    { label: "Inquiry", value: "inquiry" },
  ];

  const paymentStatusOptions = [
    { label: "All Payments", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
    { label: "Abandoned", value: "abandoned" },
    { label: "Expired", value: "expired" },
    { label: "On Hold", value: "hold" },
  ];

  return (
    <div className="mt-6 mb-4 flex items-end gap-3 w-full">
      <div className="relative flex-grow basis-0">
        <CustomInput
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 pr-10 bg-white"
          leftIcon={<Search size={16} />}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-floating">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      <SearchableDropdown
        options={statusOptions}
        value={status}
        onChange={(val) => onStatusChange(val as string)}
        placeholder="Status"
        className="w-44 h-10"
        width="13rem"
      />
      <SearchableDropdown
        options={bookingTypeOptions}
        value={bookingType}
        onChange={(val) => onBookingTypeChange(val as string)}
        placeholder="Booking Type"
        className="w-48 h-10"
        width="15rem"
      />
      <SearchableDropdown
        options={paymentStatusOptions}
        value={paymentStatus}
        onChange={(val) => onPaymentStatusChange(val as string)}
        placeholder="Payment Status"
        className="w-48 h-10"
        width="15rem"
      />
      <Button
        variant="outline"
        size="sm"
        className="w-40 h-10"
        onClick={onClear}
      >
        Clear filters
      </Button>
    </div>
  );
};

export default BookingFilters;
