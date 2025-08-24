import React from "react";
import StatusBadge from "../StatusBadge";

export interface DualStatusBadgeProps {
  bookingStatus: string;
  paymentStatus: string;
  className?: string;
}

const DualStatusBadge: React.FC<DualStatusBadgeProps> = ({
  bookingStatus,
  paymentStatus,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <StatusBadge status={bookingStatus} type="booking" />
      <StatusBadge status={paymentStatus} type="payment" />
    </div>
  );
};

export default DualStatusBadge;
