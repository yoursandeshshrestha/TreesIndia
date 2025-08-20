"use client";

import { useEffect, useRef } from "react";

interface RazorpayCheckoutProps {
  order: {
    id: string;
    amount: number;
    currency: string;
    key_id: string;
  };
  onSuccess: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (error: any) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckout({
  order,
  onSuccess,
  onFailure,
  onClose,
}: RazorpayCheckoutProps) {
  const razorpayRef = useRef<any>(null);

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
      document.body.removeChild(script);
    };
  }, []);

  const initializeRazorpay = () => {
    if (!window.Razorpay) {
      console.error("Razorpay not loaded");
      return;
    }

    const options = {
      key: order.key_id,
      amount: order.amount, // Amount in paise
      currency: order.currency,
      name: "TREESINDIA",
      description: "Wallet Recharge",
      order_id: order.id,
      handler: function (response: any) {
        // Payment successful
        onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: "User Name", // You can get this from user profile
        email: "user@example.com", // You can get this from user profile
        contact: "9999999999", // You can get this from user profile
      },
      notes: {
        address: "TREESINDIA Wallet Recharge",
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

    razorpayRef.current = new window.Razorpay(options);
    razorpayRef.current.open();
  };

  return null; // This component doesn't render anything visible
}
