export type PaymentMethod = "wallet" | "razorpay";

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  payment_order?: PaymentOrder;
}

export interface RechargeResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface RechargeRequest {
  amount: number;
  payment_method: string;
}
