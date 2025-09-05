"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  RazorpayOptions,
  RazorpayResponse,
  RazorpayInstance,
} from "@/types/booking";

interface RazorpayCheckoutProps {
  order: {
    id: string;
    amount: number;
    currency: string;
    key_id: string;
  };
  description?: string;
  onSuccess: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (error: unknown) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function RazorpayCheckout({
  order,
  description = "Payment",
  onSuccess,
  onFailure,
  onClose,
}: RazorpayCheckoutProps) {
  const razorpayRef = useRef<RazorpayInstance | null>(null);
  const { user } = useAuth();

  const initializeRazorpay = useCallback(() => {
    if (!window.Razorpay) {
      console.error("Razorpay not loaded");
      onFailure(new Error("Razorpay script not loaded"));
      return;
    }

    if (!order.key_id) {
      console.error("Razorpay key_id is missing");
      onFailure(new Error("Razorpay key is missing"));
      return;
    }

    if (!order.id) {
      console.error("Razorpay order_id is missing");
      onFailure(new Error("Order ID is missing"));
      return;
    }

    if (!order.amount || order.amount <= 0) {
      console.error("Invalid amount");
      onFailure(new Error("Invalid payment amount"));
      return;
    }

    const options: RazorpayOptions = {
      key: order.key_id,
      amount: order.amount, // Amount in paise
      currency: order.currency,
      name: "TREESINDIA",
      description: description,
      order_id: order.id,
      handler: function (response: RazorpayResponse) {
        // Payment successful
        onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        ...(user?.name && { name: user.name }),
        contact: user?.phone || "",
      },
      theme: {
        color: "#10B981", // Green color matching the UI
      },
      modal: {
        ondismiss: function () {
          onClose();
        },
      },
    };

    try {
      razorpayRef.current = new window.Razorpay(options);
      razorpayRef.current.open();
    } catch (error) {
      console.error("Error initializing Razorpay:", error);
      onFailure(error);
    }
  }, [order, description, onSuccess, onFailure, onClose, user]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      initializeRazorpay();
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [
    order.id,
    order.amount,
    order.currency,
    order.key_id,
    initializeRazorpay,
  ]);

  return null; // This component doesn't render anything visible
}
