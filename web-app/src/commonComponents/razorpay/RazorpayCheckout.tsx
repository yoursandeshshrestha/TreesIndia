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

  // Debug logging
  console.log("RazorpayCheckout rendered with order:", order.id);

  useEffect(() => {
    console.log("RazorpayCheckout useEffect running for order:", order.id);

    // Override window.alert to prevent Razorpay's native alerts
    const originalAlert = window.alert;
    window.alert = (message: string) => {
      console.warn("Razorpay alert intercepted:", message);

      // Only intercept specific error messages that we know are problematic
      const lowerMessage = message.toLowerCase();
      const isKnownErrorAlert =
        lowerMessage.includes("oops! something went wrong. payment failed") ||
        lowerMessage.includes("payment failed") ||
        lowerMessage.includes("payment error") ||
        lowerMessage.includes("payment cancelled");

      if (isKnownErrorAlert) {
        // Suppress the alert and trigger failure callback
        console.log("Intercepting known error alert:", message);
        onFailure(new Error(message));
        return; // Don't show the alert
      } else {
        // For all other alerts, show them normally
        console.log("Showing alert normally:", message);
        originalAlert(message);
      }
    };

    // Check if Razorpay script is already loaded
    if (window.Razorpay) {
      console.log("Razorpay already loaded, initializing immediately");
      // Initialize immediately
      try {
        if (!order.key_id || !order.id || !order.amount || order.amount <= 0) {
          onFailure(new Error("Invalid order data"));
          return () => {
            window.alert = originalAlert;
          };
        }

        const options: RazorpayOptions = {
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: "TREESINDIA",
          description: description,
          order_id: order.id,
          handler: function (response: RazorpayResponse) {
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
            color: "#10B981",
          },
          modal: {
            ondismiss: function () {
              setTimeout(() => {
                onClose();
              }, 100);
            },
          },
        };

        razorpayRef.current = new window.Razorpay(options);
        razorpayRef.current.open();
      } catch (error) {
        console.error("Error initializing Razorpay:", error);
        onFailure(error);
      }
      return () => {
        window.alert = originalAlert;
      };
    }

    // Load Razorpay script only if not already loaded
    console.log("Loading Razorpay script");
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded, initializing");
      // Initialize after script loads
      try {
        if (!order.key_id || !order.id || !order.amount || order.amount <= 0) {
          onFailure(new Error("Invalid order data"));
          return;
        }

        const options: RazorpayOptions = {
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: "TREESINDIA",
          description: description,
          order_id: order.id,
          handler: function (response: RazorpayResponse) {
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
            color: "#10B981",
          },
          modal: {
            ondismiss: function () {
              setTimeout(() => {
                onClose();
              }, 100);
            },
          },
        };

        razorpayRef.current = new window.Razorpay(options);
        razorpayRef.current.open();
      } catch (error) {
        console.error("Error initializing Razorpay:", error);
        onFailure(error);
      }
    };
    document.body.appendChild(script);

    return () => {
      console.log("RazorpayCheckout cleanup for order:", order.id);
      // Restore original alert function
      window.alert = originalAlert;

      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [order.id, onFailure]);

  return null; // This component doesn't render anything visible
}
