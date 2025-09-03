# Wallet and Payment Endpoints Documentation

This document lists all the wallet and payment handling endpoints in the TreesIndia project.

## Base URL
All endpoints are prefixed with `/api/v1`

## Authentication
Most endpoints require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Payment Status Values
- `pending` - Payment initiated but not completed
- `completed` - Payment successfully processed
- `failed` - Payment failed
- `refunded` - Payment has been refunded
- `abandoned` - Payment cancelled by user
- `expired` - Payment timed out

## Payment Types
- `booking` - Payment for service booking
- `subscription` - Payment for subscription
- `wallet_recharge` - Payment for wallet recharge
- `wallet_debit` - Debit from wallet
- `refund` - Refund payment

## Payment Methods
- `razorpay` - Razorpay payment gateway
- `wallet` - Wallet payment

---

## 1. Wallet Endpoints

### 1.1 Wallet Recharge
**POST** `/wallet/recharge`

Initiates a wallet recharge for the authenticated user.

**Authentication:** Required

**Payload:**
```json
{
  "amount": 500.00,
  "payment_method": "razorpay",
  "reference_id": "optional_reference_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet recharge initiated successfully",
  "data": {
    "payment": {
      "id": 123,
      "payment_reference": "PAY_123456",
      "user_id": 1,
      "amount": 500.00,
      "status": "pending",
      "type": "wallet_recharge",
      "method": "razorpay"
    },
    "payment_order": {
      "id": "order_razorpay_id",
      "amount": 50000,
      "currency": "INR",
      "key_id": "rzp_test_xxxxx"
    }
  }
}
```

### 1.2 Complete Wallet Recharge
**POST** `/wallet/recharge/{id}/complete`

Completes a pending wallet recharge with payment verification.

**Authentication:** Required

**Payload:**
```json
{
  "razorpay_order_id": "order_razorpay_id",
  "razorpay_payment_id": "pay_razorpay_id",
  "razorpay_signature": "signature_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet recharge completed successfully",
  "data": null
}
```

### 1.3 Cancel Wallet Recharge
**POST** `/wallet/recharge/{id}/cancel`

Cancels a pending wallet recharge payment.

**Authentication:** Required

**Payload:** None

**Response:**
```json
{
  "success": true,
  "message": "Wallet recharge cancelled successfully",
  "data": null
}
```

### 1.4 Get User Transactions
**GET** `/wallet/transactions`

Gets the authenticated user's wallet transaction history.

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": 123,
        "payment_reference": "PAY_123456",
        "amount": 500.00,
        "status": "completed",
        "type": "wallet_recharge",
        "method": "razorpay",
        "created_at": "2024-01-01T10:00:00Z",
        "completed_at": "2024-01-01T10:02:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "total_pages": 5
    }
  }
}
```

### 1.5 Get Transactions by Type
**GET** `/wallet/transactions/type/{type}`

Gets user's transactions filtered by type.

**Authentication:** Required

**Path Parameters:**
- `type`: Transaction type (`recharge` or `debit`)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [...],
    "transaction_type": "recharge",
    "pagination": {...}
  }
}
```

### 1.6 Get Transaction by Reference
**GET** `/wallet/transaction/{reference_id}`

Gets a transaction by its reference ID.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 123,
    "payment_reference": "PAY_123456",
    "amount": 500.00,
    "status": "completed"
  }
}
```

### 1.7 Get Wallet Summary
**GET** `/wallet/summary`

Gets a summary of the authenticated user's wallet activity.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Wallet summary retrieved successfully",
  "data": {
    "current_balance": 1500.00,
    "total_recharged": 5000.00,
    "total_spent": 3500.00,
    "pending_transactions": 2,
    "completed_transactions": 25
  }
}
```

### 1.8 Admin Adjust Wallet
**POST** `/admin/wallet/adjust`

Admin adjustment of user's wallet balance.

**Authentication:** Required (Admin only)

**Payload:**
```json
{
  "user_id": 123,
  "amount": 100.00,
  "reason": "Compensation for service issue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet adjusted successfully",
  "data": {
    "id": 456,
    "amount": 100.00,
    "type": "wallet_recharge",
    "status": "completed",
    "description": "Admin adjustment",
    "notes": "Compensation for service issue"
  }
}
```

---

## 2. Payment Endpoints

### 2.1 Create Payment
**POST** `/payments`

Creates a new payment.

**Authentication:** Required

**Payload:**
```json
{
  "amount": 1000.00,
  "currency": "INR",
  "type": "booking",
  "method": "razorpay",
  "related_entity_type": "booking",
  "related_entity_id": 123,
  "description": "Payment for tree planting service",
  "notes": "Optional notes",
  "metadata": {
    "custom_field": "custom_value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": 789,
    "payment_reference": "PAY_789012",
    "amount": 1000.00,
    "status": "pending",
    "type": "booking",
    "method": "razorpay",
    "razorpay_order_id": "order_xyz123"
  }
}
```

### 2.2 Create Razorpay Order
**POST** `/payments/razorpay-order`

Creates a Razorpay order for payment.

**Authentication:** Required

**Payload:**
```json
{
  "amount": 1000.00,
  "currency": "INR",
  "type": "booking",
  "method": "razorpay",
  "related_entity_type": "booking",
  "related_entity_id": 123,
  "description": "Payment for tree planting service"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "data": {
    "payment": {...},
    "order": {
      "id": "order_xyz123",
      "amount": 100000,
      "currency": "INR",
      "key_id": "rzp_test_xxxxx"
    }
  }
}
```

### 2.3 Verify Payment
**POST** `/payments/{id}/verify`

Verifies and completes a payment.

**Authentication:** Required

**Payload:**
```json
{
  "status": "completed",
  "razorpay_payment_id": "pay_abc123",
  "razorpay_signature": "signature_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and completed successfully",
  "data": {
    "id": 789,
    "status": "completed",
    "razorpay_payment_id": "pay_abc123",
    "completed_at": "2024-01-01T10:05:00Z"
  }
}
```

### 2.4 Get Payment
**GET** `/payments/{id}`

Gets a payment by ID.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Payment retrieved successfully",
  "data": {
    "id": 789,
    "payment_reference": "PAY_789012",
    "amount": 1000.00,
    "status": "completed",
    "type": "booking",
    "method": "razorpay"
  }
}
```

### 2.5 Get User Payments
**GET** `/payments`

Gets payments for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by payment status
- `type` (optional): Filter by payment type
- `method` (optional): Filter by payment method
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": [
    {
      "id": 789,
      "payment_reference": "PAY_789012",
      "amount": 1000.00,
      "status": "completed",
      "type": "booking"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

### 2.6 Get Payment Statistics
**GET** `/payments/stats`

Gets payment statistics for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Payment stats retrieved successfully",
  "data": {
    "total_payments": 25,
    "total_amount": 25000.00,
    "completed_payments": 22,
    "pending_payments": 2,
    "failed_payments": 1,
    "average_payment": 1000.00
  }
}
```

### 2.7 Refund Payment (Admin)
**POST** `/admin/payments/{id}/refund`

Refunds a payment (admin only).

**Authentication:** Required (Admin only)

**Payload:**
```json
{
  "refund_amount": 500.00,
  "refund_reason": "Service cancelled by provider",
  "refund_method": "razorpay",
  "notes": "Partial refund due to cancellation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment refunded successfully",
  "data": {
    "id": 789,
    "status": "refunded",
    "refund_amount": 500.00,
    "refund_reason": "Service cancelled by provider",
    "refunded_at": "2024-01-01T15:30:00Z"
  }
}
```

---

## 3. Razorpay Endpoints

### 3.1 Create Payment Order
**POST** `/razorpay/create-order`

Creates a new Razorpay payment order for wallet recharge.

**Authentication:** Required

**Payload:**
```json
{
  "amount": 500.00,
  "receipt": "receipt_001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "order": {
      "id": "order_xyz123",
      "amount": 50000,
      "currency": "INR",
      "receipt": "receipt_001",
      "key_id": "rzp_test_xxxxx"
    },
    "transaction": {
      "id": 456,
      "amount": 500.00,
      "status": "pending",
      "type": "wallet_recharge"
    }
  }
}
```

### 3.2 Verify Payment
**POST** `/razorpay/verify`

Verifies a payment signature from Razorpay.

**Authentication:** Required

**Payload:**
```json
{
  "order_id": "order_xyz123",
  "payment_id": "pay_abc456",
  "signature": "signature_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment signature verified successfully",
  "data": null
}
```

### 3.3 Webhook Handler
**POST** `/razorpay/webhook`

Handles Razorpay webhook notifications (no authentication required).

**Authentication:** Not required (webhook endpoint)

**Headers:**
- `X-Razorpay-Signature`: Webhook signature for verification

**Payload:** Raw webhook payload from Razorpay

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": null
}
```

---

## 4. Booking Payment Endpoints

### 4.1 Create Booking with Payment
**POST** `/bookings`

Creates a new booking (includes payment handling for all booking types).

**Authentication:** Required

**Payload:**
```json
{
  "service_id": 123,
  "booking_type": "regular",
  "scheduled_date": "2024-01-15",
  "scheduled_time": "10:00:00",
  "location": {
    "address": "123 Tree Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "payment_method": "razorpay",
  "notes": "Please bring necessary tools"
}
```

**Response:**
```json
{
  "message": "Time slot reserved temporarily. Complete payment within 7 minutes to confirm your booking.",
  "booking": {
    "id": 456,
    "service_id": 123,
    "booking_type": "regular",
    "status": "pending",
    "total_amount": 1500.00,
    "payment_status": "pending"
  },
  "payment_order": {
    "id": "order_xyz789",
    "amount": 150000,
    "currency": "INR",
    "key_id": "rzp_test_xxxxx"
  },
  "payment_required": true,
  "payment_type": "booking_payment",
  "hold_expires_at": "2024-01-01T10:07:00Z"
}
```

### 4.2 Verify Booking Payment
**POST** `/bookings/{id}/verify-payment`

Verifies payment for a booking.

**Authentication:** Required

**Payload:**
```json
{
  "razorpay_order_id": "order_xyz789",
  "razorpay_payment_id": "pay_def123",
  "razorpay_signature": "signature_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and booking confirmed",
  "data": {
    "booking": {
      "id": 456,
      "status": "confirmed",
      "payment_status": "completed"
    },
    "payment": {
      "id": 789,
      "status": "completed",
      "amount": 1500.00
    }
  }
}
```

### 4.3 Create Inquiry Booking
**POST** `/bookings/inquiry`

Creates a new inquiry-based booking.

**Authentication:** Required

**Payload:**
```json
{
  "service_id": 123,
  "location": {
    "address": "456 Garden Avenue",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "inquiry_details": "Need consultation for large garden area",
  "preferred_date": "2024-01-20",
  "payment_method": "razorpay"
}
```

**Response:**
```json
{
  "message": "Inquiry booking created. Payment required for inquiry fee.",
  "booking": {
    "id": 789,
    "booking_type": "inquiry",
    "status": "pending",
    "inquiry_fee": 200.00,
    "payment_status": "pending"
  },
  "payment_order": {
    "id": "order_inquiry_123",
    "amount": 20000,
    "currency": "INR"
  },
  "payment_required": true,
  "payment_type": "inquiry_fee"
}
```

### 4.4 Verify Inquiry Payment
**POST** `/bookings/inquiry/verify-payment`

Verifies payment for an inquiry booking.

**Authentication:** Required

**Payload:**
```json
{
  "booking_id": 789,
  "razorpay_order_id": "order_inquiry_123",
  "razorpay_payment_id": "pay_inquiry_456",
  "razorpay_signature": "signature_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inquiry payment verified successfully",
  "data": {
    "booking": {
      "id": 789,
      "status": "inquiry_paid",
      "payment_status": "completed"
    }
  }
}
```

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors, invalid data)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error (server-side errors)

---

## Rate Limiting

Payment endpoints may have rate limiting applied to prevent abuse. Check response headers for rate limiting information:
- `X-RateLimit-Limit`: Maximum requests per time window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Security Notes

1. All payment verification must include proper signature validation
2. Webhook endpoints verify Razorpay signatures before processing
3. Sensitive payment information is not logged or stored unnecessarily
4. All monetary amounts are handled with proper precision to avoid rounding errors
5. Payment timeouts are implemented to prevent indefinite pending states