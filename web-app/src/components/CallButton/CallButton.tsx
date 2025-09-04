import React, { useState } from "react";
import { Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { callMaskingApi } from "@/lib/callMaskingApi";

interface CallButtonProps {
  bookingId: number;
  userType: "customer" | "worker";
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
}

export const CallButton: React.FC<CallButtonProps> = ({
  bookingId,
  userType,
  className = "",
  size = "md",
  variant = "default",
}) => {
  const [isCalling, setIsCalling] = useState(false);

  const handleCall = async () => {
    setIsCalling(true);
    try {
      await callMaskingApi.initiateCall(bookingId);
      toast.success("Call initiated successfully");
    } catch (error: any) {
      console.error("Failed to initiate call:", error);
      toast.error(error.response?.data?.message || "Can't call right now");
    } finally {
      setIsCalling(false);
    }
  };

  const getButtonText = () => {
    if (isCalling) return "Calling...";
    return `Call ${userType === "customer" ? "Worker" : "Customer"}`;
  };

  const getButtonIcon = () => {
    if (isCalling) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    return <Phone className="w-4 h-4" />;
  };

  return (
    <Button
      onClick={handleCall}
      disabled={isCalling}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
};
